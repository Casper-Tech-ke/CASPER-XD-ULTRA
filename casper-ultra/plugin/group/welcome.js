require('../../setting')

module.exports = {
    type: 'group',
    command: ['welcome', 'left', 'groupevent'],
    operate: async (context) => {
        const { command, args, m, reply, isAdmins, managerCasper } = context
        if (!m.isGroup) return reply('Only available in groups')
        if (!isAdmins && !managerCasper) return reply(global.mess.OnlyOwner)
        if (args.length < 1) return reply(`Example: ${command} on/off`)
        if (command === 'welcome' || command === 'left') {
            if (args[0] === 'hidup') {
                global.welcome = true
                reply(`${command} has been enabled`)
            } else if (args[0] === 'mati') {
                global.welcome = false
                reply(`${command} has been disabled`)
            }
        } else if (command === 'groupevent') {
            if (args[0] === 'hidup') {
                global.groupevent = true
                reply(`${command} has been enabled`)
            } else if (args[0] === 'mati') {
                global.groupevent = false
                reply(`${command} has been disabled`)
            }
        }
    }
}
