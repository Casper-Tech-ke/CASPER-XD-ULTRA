module.exports = {
    type: 'owner',
    command: ['seprefix', 'sp', 'switchprefix', 'switchp'],
    operate: async (context) => {
        const { managerCasper, reply, prefix, command, text } = context
        
        if (!managerCasper) return reply(global.mess.OnlyOwner)
        if (!text) return reply(`Current prefix: *${global.prefix}*\n\nUsage: ${prefix + command} <new prefix>\n\nYou can set any single character, letter, or emoji as prefix.`)
        const newPrefix = [...text.trim()][0]
        if (!newPrefix) return reply(`Please provide a valid character for the prefix.`)
        global.prefix = newPrefix
        global.db.settings.set('prefix', newPrefix)
        reply(`Prefix switched to: *${newPrefix}*\n\nNow use commands like: *${newPrefix}menu*`)
    }
}
