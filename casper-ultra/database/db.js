const Database = require('better-sqlite3');
const path = require('path');
const zlib = require('zlib');

const DB_PATH = path.join(__dirname, 'casper.db');

const BufferJSON = {
    replacer: (k, value) => {
        if (Buffer.isBuffer(value) || value instanceof Uint8Array || value?.type === 'Buffer') {
            return { type: 'Buffer', data: Buffer.from(value?.data || value).toString('base64') };
        }
        return value;
    },
    reviver: (_, value) => {
        if (typeof value === 'object' && value !== null && value.type === 'Buffer' && typeof value.data === 'string') {
            return Buffer.from(value.data, 'base64');
        }
        return value;
    }
};

let db;

function getDb() {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        initTables(db);
    }
    return db;
}

function initTables(d) {
    d.exec(`
        CREATE TABLE IF NOT EXISTS credentials (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
    `);

    d.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT NOT NULL,
            chat TEXT NOT NULL,
            sender TEXT,
            from_me INTEGER DEFAULT 0,
            is_group INTEGER DEFAULT 0,
            message_type TEXT,
            body TEXT,
            timestamp INTEGER,
            raw_data TEXT,
            PRIMARY KEY (id, chat)
        );
    `);

    d.exec(`
        CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat);
        CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender);
        CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
    `);

    d.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
    `);

    d.exec(`
        CREATE TABLE IF NOT EXISTS sudos (
            number TEXT,
            lid TEXT,
            added_by TEXT,
            added_at INTEGER DEFAULT (strftime('%s','now'))
        );
    `);
    d.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_sudos_number ON sudos(number) WHERE number IS NOT NULL;`);
    d.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_sudos_lid ON sudos(lid) WHERE lid IS NOT NULL;`);

    const cols = d.prepare('PRAGMA table_info(sudos)').all().map(c => c.name);
    if (!cols.includes('lid')) {
        d.exec('ALTER TABLE sudos ADD COLUMN lid TEXT;');
        d.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_sudos_lid ON sudos(lid) WHERE lid IS NOT NULL;');
    }
}

const credOps = {
    get(key) {
        const d = getDb();
        const row = d.prepare('SELECT value FROM credentials WHERE key = ?').get(key);
        return row ? JSON.parse(row.value, BufferJSON.reviver) : null;
    },
    set(key, value) {
        const d = getDb();
        d.prepare('INSERT OR REPLACE INTO credentials (key, value) VALUES (?, ?)').run(key, JSON.stringify(value, BufferJSON.replacer));
    },
    del(key) {
        const d = getDb();
        d.prepare('DELETE FROM credentials WHERE key = ?').run(key);
    },
    getAll() {
        const d = getDb();
        const rows = d.prepare('SELECT key, value FROM credentials').all();
        const result = {};
        for (const row of rows) {
            result[row.key] = JSON.parse(row.value, BufferJSON.reviver);
        }
        return result;
    },
    clear() {
        const d = getDb();
        d.prepare('DELETE FROM credentials').run();
    }
};

const msgOps = {
    save(msg) {
        const d = getDb();
        d.prepare(`INSERT OR REPLACE INTO messages (id, chat, sender, from_me, is_group, message_type, body, timestamp, raw_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
            msg.id,
            msg.chat,
            msg.sender || null,
            msg.fromMe ? 1 : 0,
            msg.isGroup ? 1 : 0,
            msg.messageType || null,
            msg.body || null,
            msg.timestamp || Math.floor(Date.now() / 1000),
            msg.rawData ? (typeof msg.rawData === 'string' ? msg.rawData : JSON.stringify(msg.rawData)) : null
        );
    },
    getByChat(chat, limit = 50) {
        const d = getDb();
        return d.prepare('SELECT * FROM messages WHERE chat = ? ORDER BY timestamp DESC LIMIT ?').all(chat, limit);
    },
    getBySender(sender, limit = 50) {
        const d = getDb();
        return d.prepare('SELECT * FROM messages WHERE sender = ? ORDER BY timestamp DESC LIMIT ?').all(sender, limit);
    },
    getById(id) {
        const d = getDb();
        return d.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    },
    getRecent(limit = 100) {
        const d = getDb();
        return d.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?').all(limit);
    },
    count() {
        const d = getDb();
        return d.prepare('SELECT COUNT(*) as count FROM messages').get().count;
    },
    deleteOlderThan(days) {
        const d = getDb();
        const cutoff = Math.floor(Date.now() / 1000) - (days * 86400);
        return d.prepare('DELETE FROM messages WHERE timestamp < ?').run(cutoff);
    },
    deleteOlderThanHours(hours) {
        const d = getDb();
        const cutoff = Math.floor(Date.now() / 1000) - (hours * 3600);
        return d.prepare('DELETE FROM messages WHERE timestamp < ?').run(cutoff);
    }
};

const settingsOps = {
    get(key, defaultValue = null) {
        const d = getDb();
        const row = d.prepare('SELECT value FROM settings WHERE key = ?').get(key);
        if (!row) return defaultValue;
        try { return JSON.parse(row.value); } catch { return row.value; }
    },
    set(key, value) {
        const d = getDb();
        const val = typeof value === 'string' ? value : JSON.stringify(value);
        d.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, val);
    },
    del(key) {
        const d = getDb();
        d.prepare('DELETE FROM settings WHERE key = ?').run(key);
    },
    getAll() {
        const d = getDb();
        const rows = d.prepare('SELECT key, value FROM settings').all();
        const result = {};
        for (const row of rows) {
            try { result[row.key] = JSON.parse(row.value); } catch { result[row.key] = row.value; }
        }
        return result;
    },
    clear() {
        const d = getDb();
        d.prepare('DELETE FROM settings').run();
    }
};

const sudoOps = {
    add(phone, lid, addedBy) {
        const d = getDb();
        const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : null;
        const cleanLid = lid ? lid.replace(/[^0-9:]/g, '') : null;
        if (!cleanPhone && !cleanLid) return;
        if (cleanPhone) {
            const existing = d.prepare('SELECT rowid FROM sudos WHERE number = ?').get(cleanPhone);
            if (existing) {
                if (cleanLid) d.prepare('UPDATE sudos SET lid = ? WHERE number = ?').run(cleanLid, cleanPhone);
                return;
            }
        }
        if (cleanLid) {
            const existing = d.prepare('SELECT rowid FROM sudos WHERE lid = ?').get(cleanLid);
            if (existing) {
                if (cleanPhone) d.prepare('UPDATE sudos SET number = ? WHERE lid = ?').run(cleanPhone, cleanLid);
                return;
            }
        }
        d.prepare('INSERT INTO sudos (number, lid, added_by) VALUES (?, ?, ?)').run(cleanPhone, cleanLid, addedBy || null);
    },
    remove(identifier) {
        const d = getDb();
        const clean = identifier.replace(/[^0-9:]/g, '');
        const r = d.prepare('DELETE FROM sudos WHERE number = ? OR lid = ?').run(clean, clean);
        return r.changes > 0;
    },
    check(identifier) {
        const d = getDb();
        const clean = identifier.replace(/[^0-9:]/g, '');
        return !!d.prepare('SELECT rowid FROM sudos WHERE number = ? OR lid = ?').get(clean, clean);
    },
    checkAny(...identifiers) {
        const d = getDb();
        for (const id of identifiers) {
            if (!id) continue;
            const clean = id.replace(/[^0-9:]/g, '');
            if (clean && d.prepare('SELECT rowid FROM sudos WHERE number = ? OR lid = ?').get(clean, clean)) {
                return true;
            }
        }
        return false;
    },
    list() {
        const d = getDb();
        return d.prepare('SELECT * FROM sudos ORDER BY added_at DESC').all();
    },
    count() {
        const d = getDb();
        return d.prepare('SELECT COUNT(*) as count FROM sudos').get().count;
    },
    clear() {
        const d = getDb();
        d.prepare('DELETE FROM sudos').run();
    }
};

const KEY_CATEGORIES = {
    identity: ['creds'],
    preKeys: 'pre-key-',
    signedPreKeys: 'signed-pre-key-',
    sessions: 'session-',
    senderKeys: 'sender-key-',
    appState: 'app-state-sync-',
};

const credManager = {
    stats() {
        const d = getDb();
        const total = d.prepare('SELECT COUNT(*) as cnt FROM credentials').get().cnt;
        const creds = d.prepare("SELECT COUNT(*) as cnt FROM credentials WHERE key = 'creds'").get().cnt;
        const preKeys = d.prepare("SELECT COUNT(*) as cnt FROM credentials WHERE key LIKE 'pre-key-%'").get().cnt;
        const signedPreKeys = d.prepare("SELECT COUNT(*) as cnt FROM credentials WHERE key LIKE 'signed-pre-key-%'").get().cnt;
        const sessions = d.prepare("SELECT COUNT(*) as cnt FROM credentials WHERE key LIKE 'session-%'").get().cnt;
        const senderKeys = d.prepare("SELECT COUNT(*) as cnt FROM credentials WHERE key LIKE 'sender-key-%'").get().cnt;
        const appState = d.prepare("SELECT COUNT(*) as cnt FROM credentials WHERE key LIKE 'app-state-sync-%'").get().cnt;
        const other = total - creds - preKeys - signedPreKeys - sessions - senderKeys - appState;

        const credsData = credOps.get('creds');
        const credsInfo = credsData ? {
            registered: !!credsData.registered,
            nextPreKeyId: credsData.nextPreKeyId,
            firstUnuploadedPreKeyId: credsData.firstUnuploadedPreKeyId,
            signedPreKeyId: credsData.signedPreKey?.keyId,
        } : null;

        return { total, creds, preKeys, signedPreKeys, sessions, senderKeys, appState, other, credsInfo };
    },

    backup(label) {
        const d = getDb();
        const ts = Date.now();
        const tag = label || `backup_${ts}`;

        d.exec(`
            CREATE TABLE IF NOT EXISTS cred_backups (
                tag TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                PRIMARY KEY (tag, key)
            );
        `);

        const rows = d.prepare('SELECT key, value FROM credentials').all();
        const insert = d.prepare('INSERT OR REPLACE INTO cred_backups (tag, key, value, created_at) VALUES (?, ?, ?, ?)');
        const tx = d.transaction(() => {
            for (const row of rows) {
                insert.run(tag, row.key, row.value, ts);
            }
        });
        tx();

        return { tag, keyCount: rows.length, timestamp: ts };
    },

    listBackups() {
        const d = getDb();
        try {
            const rows = d.prepare(`
                SELECT tag, COUNT(*) as key_count, MIN(created_at) as created_at
                FROM cred_backups GROUP BY tag ORDER BY created_at DESC
            `).all();
            return rows;
        } catch {
            return [];
        }
    },

    deleteBackup(tag) {
        const d = getDb();
        const r = d.prepare('DELETE FROM cred_backups WHERE tag = ?').run(tag);
        return r.changes > 0;
    },

    safeSessionReset() {
        const d = getDb();
        const results = {};

        results.sessionsBefore = d.prepare("SELECT COUNT(*) as cnt FROM credentials WHERE key LIKE 'session-%'").get().cnt;
        results.senderKeysBefore = d.prepare("SELECT COUNT(*) as cnt FROM credentials WHERE key LIKE 'sender-key-%'").get().cnt;

        const tx = d.transaction(() => {
            d.prepare("DELETE FROM credentials WHERE key LIKE 'session-%'").run();
            d.prepare("DELETE FROM credentials WHERE key LIKE 'sender-key-%'").run();
        });
        tx();

        results.sessionsAfter = 0;
        results.senderKeysAfter = 0;
        results.preKeysPreserved = d.prepare("SELECT COUNT(*) as cnt FROM credentials WHERE key LIKE 'pre-key-%'").get().cnt;
        results.signedPreKeysPreserved = d.prepare("SELECT COUNT(*) as cnt FROM credentials WHERE key LIKE 'signed-pre-key-%'").get().cnt;
        results.credsPreserved = !!d.prepare("SELECT key FROM credentials WHERE key = 'creds'").get();

        return results;
    },

    fullKeyReset() {
        const d = getDb();
        const results = {};

        const tx = d.transaction(() => {
            results.sessions = d.prepare("DELETE FROM credentials WHERE key LIKE 'session-%'").run().changes;
            results.senderKeys = d.prepare("DELETE FROM credentials WHERE key LIKE 'sender-key-%'").run().changes;
            results.preKeys = d.prepare("DELETE FROM credentials WHERE key LIKE 'pre-key-%'").run().changes;
            results.signedPreKeys = d.prepare("DELETE FROM credentials WHERE key LIKE 'signed-pre-key-%'").run().changes;
            results.appState = d.prepare("DELETE FROM credentials WHERE key LIKE 'app-state-sync-%'").run().changes;

            const credsRow = d.prepare("SELECT value FROM credentials WHERE key = 'creds'").get();
            if (credsRow) {
                const creds = JSON.parse(credsRow.value, BufferJSON.reviver);
                creds.nextPreKeyId = 1;
                creds.firstUnuploadedPreKeyId = 1;
                delete creds.signedPreKey;
                d.prepare("INSERT OR REPLACE INTO credentials (key, value) VALUES ('creds', ?)").run(
                    JSON.stringify(creds, BufferJSON.replacer)
                );
                results.credsReset = true;
            }
        });
        tx();

        return results;
    },

    restore(tag) {
        const d = getDb();
        const rows = d.prepare('SELECT key, value FROM cred_backups WHERE tag = ?').all(tag);
        if (!rows.length) return { success: false, error: 'Backup not found' };

        const tx = d.transaction(() => {
            d.prepare('DELETE FROM credentials').run();
            const insert = d.prepare('INSERT INTO credentials (key, value) VALUES (?, ?)');
            for (const row of rows) {
                insert.run(row.key, row.value);
            }
        });
        tx();

        const credsRow = d.prepare("SELECT value FROM credentials WHERE key = 'creds'").get();
        const validation = { success: true, keysRestored: rows.length };
        if (credsRow) {
            const creds = JSON.parse(credsRow.value, BufferJSON.reviver);
            const preKeyCount = d.prepare("SELECT COUNT(*) as cnt FROM credentials WHERE key LIKE 'pre-key-%'").get().cnt;
            const pendingUpload = creds.nextPreKeyId - creds.firstUnuploadedPreKeyId;
            if (preKeyCount === 0 && pendingUpload === 0) {
                creds.nextPreKeyId = 1;
                creds.firstUnuploadedPreKeyId = 1;
                d.prepare("INSERT OR REPLACE INTO credentials (key, value) VALUES ('creds', ?)").run(
                    JSON.stringify(creds, BufferJSON.replacer)
                );
                validation.counterFixed = true;
            }
        }

        return validation;
    },

    ensureSignedPreKey() {
        const d = getDb();
        const signed = d.prepare("SELECT COUNT(*) as cnt FROM credentials WHERE key LIKE 'signed-pre-key-%'").get().cnt;
        if (signed > 0) return { action: 'already_exists', count: signed };

        const credsRow = d.prepare("SELECT value FROM credentials WHERE key = 'creds'").get();
        if (!credsRow) return { action: 'no_creds', count: 0 };

        const creds = JSON.parse(credsRow.value, BufferJSON.reviver);
        if (!creds.signedPreKey) return { action: 'no_signed_prekey_in_creds', count: 0 };

        const key = `signed-pre-key-${creds.signedPreKey.keyId}`;
        credOps.set(key, creds.signedPreKey);
        return { action: 'restored_from_creds', count: 1, keyId: creds.signedPreKey.keyId };
    },
};

function useSQLiteAuthState(baileysProto, baileysInitAuthCreds) {
    const creds = credOps.get('creds') || baileysInitAuthCreds();
    return {
        state: {
            creds,
            keys: {
                get(type, ids) {
                    const data = {};
                    for (const id of ids) {
                        const val = credOps.get(`${type}-${id}`);
                        if (val) {
                            if (type === 'app-state-sync-key') {
                                data[id] = baileysProto.Message.AppStateSyncKeyData.fromObject(val);
                            } else {
                                data[id] = val;
                            }
                        }
                    }
                    return data;
                },
                set(data) {
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            if (value) {
                                credOps.set(key, value);
                            } else {
                                credOps.del(key);
                            }
                        }
                    }
                }
            }
        },
        saveCreds() {
            credOps.set('creds', creds);
        }
    };
}

function loadSession(sessionString) {
    try {
        if (!sessionString || typeof sessionString !== 'string') {
            throw new Error('SESSION is missing or invalid');
        }

        let b64data;

        if (sessionString.startsWith('CASPER;;;')) {
            b64data = sessionString.split(';;;')[1];
        } else if (sessionString.startsWith('CASPER-XD-ULTRA;')) {
            b64data = sessionString.substring('CASPER-XD-ULTRA;'.length);
        } else {
            throw new Error("Invalid session format. Expected 'CASPER;;;.....' or 'CASPER-XD-ULTRA;.....'");
        }

        if (!b64data) {
            throw new Error("Session data is empty");
        }

        const cleanB64 = b64data.replace(/\.\.\./g, '');
        const compressedData = Buffer.from(cleanB64, 'base64');
        const decompressedData = zlib.gunzipSync(compressedData);
        const sessionData = JSON.parse(decompressedData.toString('utf8'));

        const credsFields = [
            'noiseKey', 'pairingEphemeralKeyPair', 'signedIdentityKey', 'signedPreKey',
            'registrationId', 'advSecretKey', 'processedHistoryMessages', 'nextPreKeyId',
            'firstUnuploadedPreKeyId', 'accountSyncCounter', 'accountSettings', 'account',
            'me', 'signalIdentities', 'lastAccountSyncTimestamp', 'myAppStateKeyId',
            'registered', 'lastPropHash', 'routingInfo', 'pairingCode', 'platform'
        ];

        const isFlatFormat = !sessionData.creds && credsFields.some(f => f in sessionData);

        const d = getDb();
        const tx = d.transaction(() => {
            d.prepare('DELETE FROM credentials').run();
            const insert = d.prepare('INSERT INTO credentials (key, value) VALUES (?, ?)');

            if (isFlatFormat) {
                const credsObj = {};
                const otherKeys = {};
                for (const [key, value] of Object.entries(sessionData)) {
                    if (credsFields.includes(key)) {
                        credsObj[key] = value;
                    } else {
                        otherKeys[key] = value;
                    }
                }
                insert.run('creds', JSON.stringify(credsObj));
                for (const [key, value] of Object.entries(otherKeys)) {
                    insert.run(key, typeof value === 'string' ? value : JSON.stringify(value));
                }
            } else {
                for (const [key, value] of Object.entries(sessionData)) {
                    insert.run(key, typeof value === 'string' ? value : JSON.stringify(value, BufferJSON.replacer));
                }
            }
        });
        tx();

        const imported = Object.keys(sessionData).length;
        console.log(`✅ Session loaded into database (${imported} keys imported${isFlatFormat ? ', consolidated into creds' : ''})`);
        return true;
    } catch (e) {
        console.error('❌ Session Load Error:', e.message);
        return false;
    }
}

function exportSession() {
    try {
        const d = getDb();
        const rows = d.prepare('SELECT key, value FROM credentials').all();
        if (!rows.length) {
            throw new Error('No credentials found in database');
        }

        const sessionData = {};
        for (const row of rows) {
            sessionData[row.key] = row.value;
        }

        const sessionJson = JSON.stringify(sessionData);
        const compressed = zlib.gzipSync(Buffer.from(sessionJson, 'utf8'));
        const b64 = compressed.toString('base64');
        const sessionString = `CASPER;;;${b64}`;

        return sessionString;
    } catch (e) {
        console.error('❌ Session Export Error:', e.message);
        return null;
    }
}

function hasSession() {
    const creds = credOps.get('creds');
    if (!creds || !creds.registered) return false;
    const d = getDb();
    const keyCount = d.prepare('SELECT COUNT(*) as cnt FROM credentials').get().cnt;
    return keyCount > 1;
}

function closeDb() {
    if (db) {
        db.close();
        db = null;
    }
}

module.exports = {
    getDb,
    credOps,
    credManager,
    msgOps,
    settingsOps,
    sudoOps,
    useSQLiteAuthState,
    loadSession,
    exportSession,
    hasSession,
    closeDb
};
