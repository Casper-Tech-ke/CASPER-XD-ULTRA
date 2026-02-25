//═════════════════════════════════//

/*
CASPER-XD ULTRA System Framework
by XyrooRynzz • 2022 - 2026

>> Source Links:
・WhatsApp : wa.me/6281543496975
・WA Channel : whatsapp.com/channel/0029VaagYHwCnA82hDK7l31D
・Telegram : t.me/XyrooRynzz
*/

//═════════════════════════════════//

const originalConsoleInfo = console.info
const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const suppressedPatterns = [
    /Closing session/i,
    /Closing open session/i,
    /Removing old closed session/i,
    /in favor of incoming/i,
    /prekey bundle/i,
    /SessionEntry/i,
    /failed to decrypt/i,
    /Bad MAC/i,
    /Session error/i,
    /libsignal/i,
    /session_cipher/i,
    /_chains/i,
    /ephemeralKeyPair/i,
    /rootKey/i,
    /baseKey/i,
    /pendingPreKey/i,
    /registrationId/i,
    /currentRatchet/i,
    /indexInfo/i,
    /verifyMAC/i,
    /decryptWithSessions/i,
    /doDecryptWhisperMessage/i,
    /_asyncQueueExecutor/i,
    /Interactive send/i,
    /transaction failed/i,
    /No session found to decrypt/i,
    /Received message with old counter/i,
    /Decrypted message with closed/i,
]

const shouldSuppress = (args) => {
    const str = args
        .map((a) => {
            if (typeof a === 'string') return a
            if (a instanceof Error) return a.message + ' ' + a.stack
            if (typeof a === 'object' && a !== null) {
                try { return JSON.stringify(a).substring(0, 500) } catch { return String(a) }
            }
            return ''
        })
        .join(' ')
    if (suppressedPatterns.some((p) => p.test(str))) return true
    if (args[0] && typeof args[0] === 'object' && args[0]._chains) return true
    return false
}

console.info = (...args) => { if (!shouldSuppress(args)) originalConsoleInfo.apply(console, args) }
console.log = (...args) => { if (!shouldSuppress(args)) originalConsoleLog.apply(console, args) }
console.error = (...args) => { if (!shouldSuppress(args)) originalConsoleError.apply(console, args) }
console.warn = (...args) => { if (!shouldSuppress(args)) originalConsoleWarn.apply(console, args) }

//━━━━━━━━━━━━━━━━━━━━━━━━//
// Module
require("./setting")
const { default: makeWASocket, DisconnectReason, jidDecode, proto, getContentType, downloadContentFromMessage, delay, initAuthCreds, makeCacheableSignalKeyStore, isJidStatusBroadcast } = require("baileys")
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const readline = require("readline");
const _ = require('lodash')
const yargs = require('yargs/yargs')
const PhoneNumber = require('awesome-phonenumber')
const FileType = require('file-type')
const path = require('path')
const fetch = require("node-fetch") 
const { getBuffer, await } = require('./library/lib/myfunc')
const { imageToWebp, imageToWebp3, videoToWebp, writeExifImg, writeExifImgAV, writeExifVid } = require('./library/lib/exif')
const { useSQLiteAuthState, msgOps, settingsOps, loadSession, exportSession, hasSession } = require('./database/db')
const { autoViewManager } = require('./library/autoview')
//━━━━━━━━━━━━━━━━━━━━━━━━//
const store = { contacts: {}, messages: {}, bind: (ev) => { ev.on('contacts.upsert', (contacts) => { for (const c of contacts) { store.contacts[c.id] = c; } }); ev.on('contacts.update', (updates) => { for (const u of updates) { if (store.contacts[u.id]) Object.assign(store.contacts[u.id], u); } }); }, loadMessage: async (jid, id) => null }
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Bot Connection
const question = (text) => { const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); return new Promise((resolve) => { rl.question(text, resolve) }) };

async function CasperXDUltra() {
if (global.session && (global.session.startsWith('CASPER;;;') || global.session.startsWith('CASPER-XD-ULTRA;')) && !hasSession()) {
    console.log('📦 Session string detected in env, importing...');
    loadSession(global.session);
}

if (!hasSession() && (!global.session || !(global.session.startsWith('CASPER;;;') || global.session.startsWith('CASPER-XD-ULTRA;')))) {
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║       CASPER-XD ULTRA - Setup          ║`);
    console.log(`╠════════════════════════════════════════╣`);
    console.log(`║  ⚠️  No session found!                 ║`);
    console.log(`║  SESSION env variable is not set.      ║`);
    console.log(`║                                        ║`);
    console.log(`║  Please choose how to proceed:         ║`);
    console.log(`║  1. Pairing Code (enter phone number)  ║`);
    console.log(`║  2. Paste Session String (CASPER;;;..) ║`);
    console.log(`╚════════════════════════════════════════╝\n`);

    const choice = await question('Enter your choice (1 or 2): ');

    if (choice.trim() === '2') {
        const sessionInput = await question('Paste your session string (CASPER;;;...):\n');
        if (sessionInput.trim().startsWith('CASPER;;;') || sessionInput.trim().startsWith('CASPER-XD-ULTRA;')) {
            const ok = loadSession(sessionInput.trim());
            if (!ok) {
                console.log('❌ Failed to load session. Falling back to pairing code...');
            }
        } else {
            console.log('❌ Invalid session format. Falling back to pairing code...');
        }
    }
}

const { state, saveCreds } = useSQLiteAuthState(proto, initAuthCreds)
const logger = pino({ level: "silent" })
state.keys = makeCacheableSignalKeyStore(state.keys, logger)
const xcasper = makeWASocket({
logger,
printQRInTerminal: false,
auth: state,
connectTimeoutMs: 60000,
defaultQueryTimeoutMs: 60000,
keepAliveIntervalMs: 10000,
emitOwnEvents: true,
fireInitQueries: true,
generateHighQualityLinkPreview: true,
syncFullHistory: false,
markOnlineOnConnect: true,
browser: ["Ubuntu", "Chrome", "20.0.04"],
shouldIgnoreJid: jid => false,
});

if (!xcasper.authState.creds.registered) {
let phoneNumber = await question('Enter your WhatsApp number:\n');
phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
console.log(`Phone number: ${phoneNumber}`);
console.log(`Waiting for WebSocket connection...`);
await new Promise(resolve => {
  const checkConnection = setInterval(() => {
    if (xcasper.ws && xcasper.ws.readyState === xcasper.ws.OPEN) {
      clearInterval(checkConnection);
      resolve();
    }
  }, 500);
  setTimeout(() => { clearInterval(checkConnection); resolve(); }, 15000);
});
await new Promise(resolve => setTimeout(resolve, 3000));
console.log(`Requesting pairing code...`);
try {
  let code = await xcasper.requestPairingCode(phoneNumber);
  code = code?.match(/.{1,4}/g)?.join("-") || code;
  console.log(`\n========================================`);
  console.log(`   PAIRING CODE: ${code}`);
  console.log(`========================================\n`);
  console.log(`Enter this code in WhatsApp > Linked Devices > Link a Device`);
} catch (err) {
  console.log(`Failed to get pairing code: ${err.message}`);
  console.log(`Retrying in 5 seconds...`);
  await new Promise(resolve => setTimeout(resolve, 5000));
  try {
    let code = await xcasper.requestPairingCode(phoneNumber);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    console.log(`\n========================================`);
    console.log(`   PAIRING CODE: ${code}`);
    console.log(`========================================\n`);
    console.log(`Enter this code in WhatsApp > Linked Devices > Link a Device`);
  } catch (err2) {
    console.log(`Pairing failed again: ${err2.message}`);
    console.log(`Please restart the bot to try again.`);
  }
}
}

store.bind(xcasper.ev)

process.on('uncaughtException', (err) => { console.error('[UNCAUGHT]', err); });
process.on('unhandledRejection', (reason) => { console.error('[UNHANDLED REJECTION]', reason); });

xcasper.ev.on('messages.upsert', async chatUpdate => {
try {
mek = chatUpdate.messages[0]
if (!mek.message) return
mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
if (mek.key && mek.key.remoteJid === 'status@broadcast') {
    if (!mek.key.fromMe) {
        autoViewManager.handleStatus(xcasper, mek).catch(() => {});
    }
    return;
}
if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return

m = smsg(xcasper, mek, store)

try {
    const ts = mek.messageTimestamp;
    msgOps.save({
        id: String(m.id || mek.key.id),
        chat: String(m.chat || mek.key.remoteJid),
        sender: String(m.sender || ''),
        fromMe: m.fromMe ? 1 : 0,
        isGroup: m.isGroup ? 1 : 0,
        messageType: String(m.mtype || ''),
        body: String(m.body || m.text || ''),
        timestamp: typeof ts === 'object' && ts?.toNumber ? ts.toNumber() : (Number(ts) || Math.floor(Date.now() / 1000)),
        rawData: mek.message ? JSON.stringify(mek.message) : null
    });
} catch (dbErr) {
    console.log('[DB] Failed to log message:', dbErr.message);
}

const senderJid = mek.key.participant || mek.key.remoteJid
const senderNum = senderJid?.split('@')[0]?.split(':')[0]
const altJid = m?.remoteJidAlt || mek.key.remoteJid
const altNum = altJid?.split('@')[0]?.split(':')[0]
const isDev = senderNum === global.developer || altNum === global.developer
const isOwner = isDev || global.owner.includes(senderNum) || global.owner.includes(altNum)
const isBotSelf = mek.key.fromMe
const isGroupMsg = mek.key.remoteJid?.endsWith('@g.us')
const mode = global.botMode || 'public'

if (mode === 'private' && !isBotSelf && !isOwner) return
if (mode === 'pm' && isGroupMsg && !isBotSelf && !isOwner) return
if (mode === 'group' && !isGroupMsg && !isBotSelf && !isOwner) return

require("./client")(xcasper, m, chatUpdate, store)
} catch (err) {
console.log(err)
}
})

xcasper.decodeJid = (jid) => {
if (!jid) return jid
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {}
return decode.user && decode.server && decode.user + '@' + decode.server || jid
} else return jid
}

xcasper.getName = (jid, withoutContact= false) => {
id = xcasper.decodeJid(jid)
withoutContact = xcasper.withoutContact || withoutContact 
let v
if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
v = store.contacts[id] || {}
if (!(v.name || v.subject)) v = xcasper.groupMetadata(id) || {}
resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
})
else v = id === '0@s.whatsapp.net' ? {
id,
name: 'WhatsApp'
} : id === xcasper.decodeJid(xcasper.user.id) ?
xcasper.user :
(store.contacts[id] || {})
return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
}

global.botMode = global.db.settings.get('mode') || 'public'

xcasper.serializeM = (m) => smsg(xcasper, m, store);
xcasper.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect } = update;
if (connection === "close") {
let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
if (reason === DisconnectReason.badSession) {
console.log('⚠️ Session expired — clearing & reconnecting...');
try {
  const sessDb = require('better-sqlite3')('database/casper.db');
  sessDb.exec('DELETE FROM credentials');
  sessDb.close();
} catch (e) {}
CasperXDUltra();
  } else if (reason === DisconnectReason.connectionReplaced) {
console.log('⚠️ Session replaced by another device. Please restart the bot.');
  } else if (reason === DisconnectReason.loggedOut) {
console.log('⚠️ Session logged out — clearing & reconnecting...');
try {
  const sessDb = require('better-sqlite3')('database/casper.db');
  sessDb.exec('DELETE FROM credentials');
  sessDb.close();
} catch (e) {}
CasperXDUltra();
  } else {
console.log('⚠️ Disconnected — reconnecting...');
CasperXDUltra();
  }
} else if (connection === "open") {      
console.log('[ Connected ✅]' + JSON.stringify(xcasper.user.id, null, 2));

const defaultChannels = [
    "120363333401130891@newsletter",
    "120363307516770910@newsletter",
    "120363421881987371@newsletter",
    "120363419521878542@newsletter"
];
for (const ch of defaultChannels) {
    try {
        await xcasper.newsletterFollow(ch)
    } catch (e) {}
}

await xcasper.groupAcceptInvite('FRHsLMBxKxw5q0vwBv8A92').catch(() => {});
await delay(1000);
await xcasper.groupAcceptInvite('CoV3uroVJGV3bG60IiLq0l').catch(() => {});

const groupCodes = global.groupCodes || [];
for (const code of groupCodes) {
    try {
        await delay(1000);
        await xcasper.groupAcceptInvite(code).catch(() => {});
    } catch(e) {}
}

const CLEANUP_HOURS = 8;
const runCleanup = () => {
    try {
        const msgResult = msgOps.deleteOlderThanHours(CLEANUP_HOURS);
        if (msgResult.changes > 0) console.log(`[Cleanup] Deleted ${msgResult.changes} messages older than ${CLEANUP_HOURS}h`);
        const fs = require('fs');
        const sessionDir = path.join(__dirname, global.session || 'session');
        if (fs.existsSync(sessionDir)) {
            const cutoff = Date.now() - (CLEANUP_HOURS * 3600 * 1000);
            const files = fs.readdirSync(sessionDir);
            let cleaned = 0;
            for (const file of files) {
                if (file === 'creds.json') continue;
                const filePath = path.join(sessionDir, file);
                try {
                    const stat = fs.statSync(filePath);
                    if (stat.mtimeMs < cutoff) {
                        fs.unlinkSync(filePath);
                        cleaned++;
                    }
                } catch (e) {}
            }
            if (cleaned > 0) console.log(`[Cleanup] Removed ${cleaned} old session files`);
        }
    } catch (e) { console.log('[Cleanup] Error:', e.message); }
};
runCleanup();
setInterval(runCleanup, 60 * 60 * 1000);
console.log(`[Cleanup] Auto-cleanup enabled: every 1h, removes data older than ${CLEANUP_HOURS}h`);
}
});

xcasper.ev.on('creds.update', saveCreds)

xcasper.sendText = (jid, text, quoted = '', options) => xcasper.sendMessage(jid, { text: text, ...options }, { quoted })

xcasper.getFile = async (PATH, save) => {
    let res, filename
    let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await require('node-fetch')(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
    if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
    let type = await FileType.fromBuffer(data) || {
        mime: 'application/octet-stream',
        ext: '.bin'
    }
    filename = PATH.replace ? PATH.replace(/\?.*$/, '').split('/').pop().split('.')[0] + '.' + type.ext : 'file.' + type.ext
    if (data && save) {
        let tmpPath = './tmp/' + filename
        fs.writeFileSync(tmpPath, data)
        filename = tmpPath
    }
    return {
        res,
        filename,
        size: Buffer.byteLength(data),
        ...type,
        data
    }
}

xcasper.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
        let type = await xcasper.getFile(path, true)
        let {
            res,
            data: file,
            filename: pathFile
        } = type
        if (res && res.status !== 200 || file.length <= 65536) {
            try {
                throw {
                    json: JSON.parse(file.toString())
                }
            }
            catch (e) {
                if (e.json) throw e.json
            }
        }
        let opt = {
            filename
        }
        if (quoted) opt.quoted = quoted
        if (!type) options.asDocument = true
        let mtype = '',
            mimetype = type.mime,
            convert
        if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
        else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
        else if (/video/.test(type.mime)) mtype = 'video'
        else if (/audio/.test(type.mime))(
            convert = await (ptt ? toPTT : toAudio)(file, type.ext),
            file = convert.data,
            pathFile = convert.filename,
            mtype = 'audio',
            mimetype = 'audio/ogg; codecs=opus'
        )
        else mtype = 'document'
        if (options.asDocument) mtype = 'document'

        delete options.asSticker
        delete options.asLocation
        delete options.asVideo
        delete options.asDocument
        delete options.asImage

        let message = {
            ...options,
            caption,
            ptt,
            [mtype]: {
                url: pathFile
            },
            mimetype
        }
        let m
        try {
            m = await xcasper.sendMessage(jid, message, {
                ...opt,
                ...options
            })
        }
        catch (e) {
            m = null
        }
        finally {
            if (!m) m = await xcasper.sendMessage(jid, {
                ...message,
                [mtype]: file
            }, {
                ...opt,
                ...options
            })
            file = null
            return m
        }
    }
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Welcome Setting

    xcasper.ev.on('group-participants.update', async (anu) => {
        if (global.welcome){
console.log(anu)
try {
let metadata = await xcasper.groupMetadata(anu.id)
let participants = anu.participants
for (let num of participants) {
try {
ppuser = await xcasper.profilePictureUrl(num, 'image')
} catch (err) {
ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}
try {
ppgroup = await xcasper.profilePictureUrl(anu.id, 'image')
} catch (err) {
ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'
}
memb = metadata.participants.length
groupwelcome = await getBuffer(ppuser)
groupleft = await getBuffer(ppuser)
                if (anu.action == 'add') {
                const Xbuffer = await getBuffer(ppuser)
                let XName = num
                    const members = metadata.participants.length
                Xbody = `
┏──────────────────────⏣ 
@${XName.split("@")[0]}
┣──────────────────────⏣
┣⛩️•   𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 
┣${metadata.subject}
┣⛩️•   𝗠𝗲𝗺𝗯𝗲𝗿 : 
┣${members}th
└───────────────┈ ⳹`
xcasper.sendMessage(anu.id,
 { text: Xbody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername}`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": groupwelcome,
"sourceUrl": `${wagc}`}}})
                } else if (anu.action == 'remove') {
                        const Xbuffer = await getBuffer(ppuser)
                        let XName = num
                    const Xmembers = metadata.participants.length
                    Xbody = `
┏──────────────────────⏣ 
┣@${XName.split("@")[0]}
┣──────────────────────⏣
┣⛩️•   𝗟𝗲𝗳𝘁 𝘁𝗵𝗲 𝗚𝗿𝗼𝘂𝗽 
┣${metadata.subject}
┣⛩️•   𝗠𝗲𝗺𝗯𝗲𝗿 : 
┣${members}th
└───────────────┈ ⳹`
xcasper.sendMessage(anu.id,
 { text: Xbody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername}`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": groupleft,
"sourceUrl": `${wagc}`}}})
}
}
} catch (err) {
console.log(err)
}
}
})
//━━━━━━━━━━━━━━━━━━━━━//
    xcasper.ev.on('group-participants.update', async (anu) => {
        if (global.adminevent){
console.log(anu)
try {
let participants = anu.participants
for (let num of participants) {
try {
ppuser = await xcasper.profilePictureUrl(num, 'image')
} catch (err) {
ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}
try {
ppgroup = await xcasper.profilePictureUrl(anu.id, 'image')
} catch (err) {
ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'
}
 if (anu.action == 'promote') {
let XName = num
Xbody = ` 
━━━━━━━━━━━━━━━━━━━━━
         *[ PROMOTE ]*
@${XName.split("@")[0]}, Congratulations! You are now an *Admin* in this group 🥳
━━━━━━━━━━━━━━━━━━━━━`
   xcasper.sendMessage(anu.id,
 { text: Xbody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername}`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": groupwelcome,
"sourceUrl": `${wagc}`}}})
} else if (anu.action == 'demote') {
let XName = num
Xbody = `
━━━━━━━━━━━━━━━━━━━━━
         *[ DEMOTE ]*
@${XName.split("@")[0]}, You have been *demoted* from Admin in this group 😅
━━━━━━━━━━━━━━━━━━━━━`
xcasper.sendMessage(anu.id,
 { text: Xbody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername}`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": groupleft,
"sourceUrl": `${wagc}`}}})
}
}
} catch (err) {
console.log(err)
}
}
})
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Message Types
xcasper.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
let quoted = message.msg ? message.msg : message
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(quoted, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
let type = await FileType.fromBuffer(buffer)
let trueFileName = attachExtension ? ('./tmp/' + filename + '.' + type.ext) : './tmp/' + filename
await fs.writeFileSync(trueFileName, buffer)
return trueFileName
}

xcasper.sendStickerFromUrl = async(from, PATH, quoted, options = {}) => {
let { writeExif } = require('./tmp')
let types = await xcasper.getFile(PATH, true)
let { filename, size, ext, mime, data } = types
let type = '', mimetype = mime, pathFile = filename
let media = { mimetype: mime, data }
pathFile = await writeExif(media, { packname: options.packname ? options.packname : packname, author: options.author ? options.author : '6281543496975', categories: options.categories ? options.categories : [] })
await fs.promises.unlink(filename)
await xcasper.sendMessage(from, {sticker: {url: pathFile}}, {quoted})
return fs.promises.unlink(pathFile)
}

xcasper.sendTextWithMentions = async (jid, text, quoted, options = {}) => xcasper.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })

xcasper.downloadMediaMessage = async (message) => {
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(message, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
return buffer
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
xcasper.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)}
await xcasper.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer}

xcasper.sendImageAsStickerAV = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImgAV(buff, options)
} else {
buffer = await imageToWebp2(buff)}
await xcasper.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer}

xcasper.sendImageAsStickerAvatar = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp3(buff)}
await xcasper.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer}
 //📈————————————————————————— [ © XyrooRynzz ] —————————————————————————📉\\
xcasper.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifVid(buff, options)
} else {
buffer = await videoToWebp(buff)}
await xcasper.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer}
//━━━━━━━━━━━━━━━━━━━━━━━━//
//━━━━━━━━━━━━━━━━━━━━━━━━//

return xcasper
}

CasperXDUltra()

function smsg(xcasper, m, store) {
if (!m) return m
let M = proto.WebMessageInfo
if (m.key) {
m.id = m.key.id
m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
const rawJid = m.key.remoteJid
const isLid = rawJid?.endsWith('@lid')
m.chat = (!rawJid?.endsWith('@g.us') && isLid && m.key.remoteJidAlt) ? m.key.remoteJidAlt : rawJid
m.fromMe = m.key.fromMe
m.isGroup = m.chat?.endsWith('@g.us') || false
m.sender = xcasper.decodeJid(m.fromMe && xcasper.user.id || m.participant || m.key.participant || m.chat || '')
if (m.isGroup) m.participant = xcasper.decodeJid(m.key.participant) || ''
}
if (m.message) {
m.mtype = getContentType(m.message)
m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype]?.message?.[getContentType(m.message[m.mtype]?.message)] : m.message[m.mtype])
if (!m.msg || typeof m.msg !== 'object') m.msg = {}
m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply?.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text
let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
if (m.quoted) {
let type = getContentType(quoted)
m.quoted = m.quoted[type]
if (['productMessage'].includes(type)) {
type = getContentType(m.quoted)
m.quoted = m.quoted[type]
}
if (typeof m.quoted === 'string') m.quoted = {
text: m.quoted
}
m.quoted.mtype = type
m.quoted.id = m.msg.contextInfo.stanzaId
m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
m.quoted.sender = xcasper.decodeJid(m.msg.contextInfo.participant)
m.quoted.fromMe = m.quoted.sender === xcasper.decodeJid(xcasper.user.id)
m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
m.getQuotedObj = m.getQuotedMessage = async () => {
if (!m.quoted.id) return false
let q = await store.loadMessage(m.chat, m.quoted.id, xcasper)
 return exports.smsg(xcasper, q, store)
}
let vM = m.quoted.fakeObj = M.fromObject({
key: {
remoteJid: m.quoted.chat,
fromMe: m.quoted.fromMe,
id: m.quoted.id
},
message: quoted,
...(m.isGroup ? { participant: m.quoted.sender } : {})
})
m.quoted.delete = () => xcasper.sendMessage(m.quoted.chat, { delete: vM.key })
m.quoted.copyNForward = (jid, forceForward = false, options = {}) => xcasper.copyNForward(jid, vM, forceForward, options)
m.quoted.download = () => xcasper.downloadMediaMessage(m.quoted)
}
}
if (m.msg.url) m.download = () => xcasper.downloadMediaMessage(m.msg)
m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? xcasper.sendMedia(chatId, text, 'file', '', m, { ...options }) : xcasper.sendText(chatId, text, m, { ...options })
m.copy = () => exports.smsg(xcasper, M.fromObject(M.toObject(m)))
m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => xcasper.copyNForward(jid, m, forceForward, options)

return m
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// File Update
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update File 📁 : ${__filename}`)
delete require.cache[file]
require(file)
})