module.exports = {
    type: 'owner',
    command: ['mode', 'private', 'public', 'pm', 'group', 'restart'],
    operate: async (context) => {
        const { managerCasper, xcasper, reply, sleep, command, q } = context
        
        if (!managerCasper) return reply(global.mess.OnlyOwner)

        if (command === 'mode') {
            if (!q) {
                const current = global.botMode || 'public'
                return reply(`🔒 *Bot Mode: ${current.toUpperCase()}*\n\nAvailable modes:\n• *.mode public* - Everyone can use\n• *.mode private* - Only bot & developer\n• *.mode pm* - Only in DM (no groups)\n• *.mode group* - Only in groups\n\nDeveloper: ${global.developer}`)
            }
            const newMode = q.toLowerCase().trim()
            if (!['public', 'private', 'pm', 'group'].includes(newMode)) {
                return reply('❌ Invalid mode. Use: public, private, pm, or group')
            }
            global.botMode = newMode
            global.db.settings.set('mode', newMode)
            reply(`✅ Bot mode changed to *${newMode.toUpperCase()}*`)
        } else if (command === 'private') {
            global.botMode = 'private'
            global.db.settings.set('mode', 'private')
            reply('✅ Bot mode changed to *PRIVATE* (only bot & developer)')
        } else if (command === 'public') {
            global.botMode = 'public'
            global.db.settings.set('mode', 'public')
            reply('✅ Bot mode changed to *PUBLIC* (everyone)')
        } else if (command === 'pm') {
            global.botMode = 'pm'
            global.db.settings.set('mode', 'pm')
            reply('✅ Bot mode changed to *PM* (DM only, no groups)')
        } else if (command === 'group') {
            global.botMode = 'group'
            global.db.settings.set('mode', 'group')
            reply('✅ Bot mode changed to *GROUP* (groups only)')
        } else if (command === 'restart') {
            reply(`Successfully Restarted ✅`)
            await sleep(3000)
            process.exit()
        }
    }
}
