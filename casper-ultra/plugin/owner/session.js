module.exports = {
    type: 'owner',
    command: ['session', 'sessionid', 'getsession'],
    operate: async (context) => {
        const { args, reply, isOwner, xcasper, m } = context

        if (!isOwner) return reply(global.mess.OnlyOwner)

        const sub = (args[0] || '').toLowerCase()
        const param = args.slice(1).join(' ')
        const { exportSession, loadSession, hasSession, credManager } = require('../../database/db')

        switch (sub) {
            case 'export':
            case 'get': {
                reply('⏳ Exporting session...')
                const sessionStr = exportSession()
                if (!sessionStr) return reply('❌ No credentials found to export.')

                try {
                    await xcasper.sendMessage(m.sender, {
                        text: `╭─ ⌬ CASPER-XD Session\n│\n│ ⚠️ Keep this PRIVATE!\n│ Do NOT share with anyone.\n│\n╰─────────────\n\n${sessionStr}`
                    })
                    return reply('✅ Session string sent to your DM. Keep it safe!')
                } catch {
                    return reply('❌ Could not send session to DM. Make sure the bot can message you.')
                }
            }

            case 'import':
            case 'load': {
                if (!param) return reply('Usage: .session import CASPER;;;...\n\nPaste the full session string after the command.')
                if (!param.startsWith('CASPER;;;')) return reply('❌ Invalid session format. Must start with CASPER;;;')
                if (hasSession()) return reply('⚠️ A session already exists. Use .session import <string> FORCE to overwrite.\n\nOr use .creds fullreset CONFIRM first to clear existing session.')
                const ok = loadSession(param)
                if (ok) {
                    return reply('✅ Session imported successfully!\n⚠️ Restart the bot for changes to take effect.')
                } else {
                    return reply('❌ Failed to import session. Check the format.')
                }
            }

            case 'forceimport': {
                if (!param) return reply('Usage: .session forceimport CASPER;;;...')
                if (!param.startsWith('CASPER;;;')) return reply('❌ Invalid session format. Must start with CASPER;;;')
                reply('⏳ Clearing existing credentials and importing...')
                const ok = loadSession(param)
                if (ok) {
                    return reply('✅ Session force-imported! All credentials replaced.\n⚠️ Restart the bot for changes to take effect.')
                } else {
                    return reply('❌ Failed to import session. Check the format.')
                }
            }

            case 'status': {
                const registered = hasSession()
                const stats = credManager.stats()
                const text = `╭─ ⌬ Session Status
│ • Registered  : ${registered ? '✅ Yes' : '❌ No'}
│ • Total Keys  : ${stats.total}
│ • Sessions    : ${stats.sessions}
│ • Pre-Keys    : ${stats.preKeys}
│ • Env SESSION : ${global.session ? (global.session.startsWith('CASPER;;;') ? '✅ Set' : '⚠️ Invalid format') : '❌ Not set'}
╰─────────────`
                return reply(text)
            }

            default: {
                return reply(`╭─ ⌬ Session Manager
│
│ .session export - Export session string (sent to DM)
│ .session import <string> - Import a session string
│ .session forceimport <string> - Overwrite existing session
│ .session status - Check session status
│
│ 💡 Use SESSION env var to auto-load on startup
│ Format: CASPER;;;base64data
│
╰─────────────`)
            }
        }
    }
}
