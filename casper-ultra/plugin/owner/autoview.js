const { autoViewManager } = require('../../library/autoview')

module.exports = {
    type: 'owner',
    command: ['autoview', 'autoviewstatus', 'viewstatus', 'autoreact', 'autoreactstatus', 'statusview'],
    operate: async (context) => {
        const { isOwner, managerCasper, xcasper, reply, args, m, from, command } = context

        if (!managerCasper) return reply(global.mess.OnlyOwner)

        if (command === 'autoreact' || command === 'autoreactstatus') {
            if (args.length === 0) {
                const stats = autoViewManager.getStats();
                return reply(`👁️ *AUTO REACT STATUS*\n\nStatus: ${stats.autoreact ? '✅ Active' : '❌ Inactive'}\nTotal Reacted: ${stats.totalReacted}\n\nUsage:\n• .autoreact on\n• .autoreact off`)
            }

            if (!isOwner) return reply(global.mess.OnlyOwner)

            const action = args[0].toLowerCase()
            if (action === 'on' || action === 'enable') {
                if (autoViewManager.reactEnabled) return reply('✅ Auto react is already active!')
                autoViewManager.setReactEnabled(true)
                return reply('✅ *AUTO REACT ENABLED*\n\nI will now react to statuses with random emojis!')
            } else if (action === 'off' || action === 'disable') {
                if (!autoViewManager.reactEnabled) return reply('❌ Auto react is already disabled.')
                autoViewManager.setReactEnabled(false)
                return reply('❌ *AUTO REACT DISABLED*\n\nI will no longer react to statuses.')
            }
            return reply('Usage: .autoreact on/off')
        }

        if (args.length === 0) {
            const stats = autoViewManager.getStats();
            let text = `👁️ *AUTO VIEW STATUS*\n\n`
            text += `Auto View: ${stats.autoview ? '✅ Active' : '❌ Inactive'}\n`
            text += `Auto React: ${stats.autoreact ? '✅ Active' : '❌ Inactive'}\n`
            text += `Total Viewed: ${stats.totalViewed}\n`
            text += `Total Reacted: ${stats.totalReacted}\n`
            text += `\nCommands:\n`
            text += `• .autoview on/off\n`
            text += `• .autoreact on/off\n`
            text += `• .autoview stats`
            return reply(text)
        }

        const action = args[0].toLowerCase()

        if (action === 'on' || action === 'enable') {
            if (!isOwner) return reply(global.mess.OnlyOwner)
            if (autoViewManager.enabled) return reply('✅ Auto view is already active!')
            autoViewManager.setEnabled(true)
            return reply('✅ *AUTO VIEW ENABLED*\n\nI will now automatically view all statuses!')
        }

        if (action === 'off' || action === 'disable') {
            if (!isOwner) return reply(global.mess.OnlyOwner)
            if (!autoViewManager.enabled) return reply('❌ Auto view is already disabled.')
            autoViewManager.setEnabled(false)
            return reply('❌ *AUTO VIEW DISABLED*\n\nI will no longer auto-view statuses.')
        }

        if (action === 'stats' || action === 'info') {
            const stats = autoViewManager.getStats();
            let text = `📊 *AUTO VIEW STATISTICS*\n\n`
            text += `Auto View: ${stats.autoview ? '✅ Active' : '❌ Inactive'}\n`
            text += `Auto React: ${stats.autoreact ? '✅ Active' : '❌ Inactive'}\n`
            text += `Total Viewed: ${stats.totalViewed}\n`
            text += `Total Reacted: ${stats.totalReacted}`
            return reply(text)
        }

        return reply('Usage: .autoview on/off/stats')
    }
}
