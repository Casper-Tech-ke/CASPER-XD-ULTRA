module.exports = {
    type: 'owner',
    command: ['creds', 'credmanager', 'keyman', 'keys'],
    operate: async (context) => {
        const { args, reply, isOwner } = context

        if (!isOwner) return reply(global.mess.owner)

        const sub = (args[0] || '').toLowerCase()
        const param = args.slice(1).join(' ')
        const { credManager } = require('../../database/db')

        switch (sub) {
            case 'stats':
            case 'info': {
                const s = credManager.stats()
                const text = `╭─ ⌬ Credential Stats
│ • Total Keys    : ${s.total}
│ • Pre-Keys      : ${s.preKeys}
│ • Signed Keys   : ${s.signedPreKeys}
│ • Sessions      : ${s.sessions}
│ • Sender Keys   : ${s.senderKeys}
│ • App State      : ${s.appState}
│ • Other          : ${s.other}
│
│ ⌬ Creds Info
│ • Registered     : ${s.credsInfo?.registered || false}
│ • Next PreKey ID : ${s.credsInfo?.nextPreKeyId || 'N/A'}
│ • First Unuploaded : ${s.credsInfo?.firstUnuploadedPreKeyId || 'N/A'}
│ • Signed Key ID  : ${s.credsInfo?.signedPreKeyId || 'N/A'}
╰─────────────`
                return reply(text)
            }

            case 'backup': {
                reply('⏳ Creating credential backup...')
                const label = param || undefined
                const result = credManager.backup(label)
                return reply(`✅ Backup created!\n• Tag: ${result.tag}\n• Keys saved: ${result.keyCount}\n• Time: ${new Date(result.timestamp).toLocaleString()}`)
            }

            case 'backups':
            case 'listbackups': {
                const backups = credManager.listBackups()
                if (!backups.length) return reply('No backups found.')
                let text = '╭─ ⌬ Credential Backups\n'
                for (const b of backups) {
                    text += `│ • ${b.tag} (${b.key_count} keys) - ${new Date(b.created_at).toLocaleString()}\n`
                }
                text += '╰─────────────'
                return reply(text)
            }

            case 'restore': {
                if (!param) return reply('Usage: .creds restore <backup_tag> CONFIRM')
                const restoreParts = param.split(' ')
                const restoreTag = restoreParts[0]
                if (restoreParts[restoreParts.length - 1] !== 'CONFIRM') return reply(`⚠️ This will replace ALL current keys with the backup.\n\nType: .creds restore ${restoreTag} CONFIRM`)
                reply('⏳ Restoring credentials from backup...')
                const result = credManager.restore(restoreTag)
                if (!result.success) return reply(`❌ ${result.error}`)
                let msg = `✅ Restored ${result.keysRestored} keys from "${restoreTag}".`
                if (result.counterFixed) msg += '\n(Pre-key counters were auto-fixed)'
                msg += '\n⚠️ Restart the bot for changes to take effect.'
                return reply(msg)
            }

            case 'deletebackup': {
                if (!param) return reply('Usage: .creds deletebackup <backup_tag>')
                const ok = credManager.deleteBackup(param)
                return reply(ok ? `✅ Backup "${param}" deleted.` : `❌ Backup "${param}" not found.`)
            }

            case 'sessionreset': {
                reply('⏳ Performing safe session reset...')
                const r = credManager.safeSessionReset()
                return reply(`✅ Safe Session Reset Complete
• Sessions cleared: ${r.sessionsBefore}
• Sender keys cleared: ${r.senderKeysBefore}
• Pre-keys preserved: ${r.preKeysPreserved}
• Signed keys preserved: ${r.signedPreKeysPreserved}
• Creds preserved: ${r.credsPreserved}

Sessions will rebuild automatically as contacts message the bot.`)
            }

            case 'fullreset': {
                if (param !== 'CONFIRM') return reply('⚠️ This will wipe ALL encryption keys and force a full re-establishment.\n\nType: .creds fullreset CONFIRM')
                reply('⏳ Performing full key reset...')
                const r = credManager.fullKeyReset()
                return reply(`✅ Full Key Reset Complete
• Sessions cleared: ${r.sessions}
• Sender keys cleared: ${r.senderKeys}
• Pre-keys cleared: ${r.preKeys}
• Signed keys cleared: ${r.signedPreKeys}
• App state cleared: ${r.appState}
• Creds reset: ${r.credsReset}

Bot will generate fresh signed + pre-keys on next restart.
⚠️ Restart the bot for changes to take effect.`)
            }

            case 'fixkeys': {
                reply('⏳ Checking and fixing signed pre-key...')
                const r = credManager.ensureSignedPreKey()
                return reply(`Signed Pre-Key: ${r.action} (count: ${r.count}${r.keyId ? ', ID: ' + r.keyId : ''})`)
            }

            default: {
                return reply(`╭─ ⌬ Credential Manager
│
│ .creds stats - View key statistics
│ .creds backup [label] - Backup all keys
│ .creds backups - List all backups
│ .creds restore <tag> - Restore from backup
│ .creds deletebackup <tag> - Delete a backup
│ .creds sessionreset - Clear sessions only (safe)
│ .creds fullreset - Clear all + reset pre-keys
│ .creds fixkeys - Fix signed pre-key
│
╰─────────────`)
            }
        }
    }
}
