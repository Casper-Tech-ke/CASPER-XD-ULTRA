require('../../setting')

module.exports = {
    type: 'group',
    command: ['add', 'kick', 'promote', 'demote', 'revoke'],
    operate: async (context) => {
        const { command, args, m, reply, xcasper, text, prefix, isAdmins, isBotAdmins, managerCasper } = context
        const mess = global.mess
        const owner = global.owner

        if (!m.isGroup) return reply(mess.OnlyGrup)

        if (command === 'add') {
            if (!isAdmins && !managerCasper) return reply(mess.admin)
            if (!isBotAdmins) return reply(mess.botAdmin)
            if (!text && !m.quoted) return reply(`_Example :_\n\n ${prefix + command} 62xxx`)
            const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender
            try {
                await xcasper.groupParticipantsUpdate(m.chat, [numbersOnly], 'add').then(async (res) => {
                    for (let i of res) {
                        let invv = await xcasper.groupInviteCode(m.chat)
                        if (i.status == 408) return reply(`_[ Error ]_ User just left the group`)
                        if (i.status == 401) return reply(`_[ Error ]_ Bot is blocked by user`)
                        if (i.status == 409) return reply(`_[ Report ]_ User is already in the group`)
                        if (i.status == 500) return reply(`_[ Invalid ]_ Group is full`)
                        if (i.status == 403) {
                            await xcasper.sendMessage(m.chat, { text: `@${numbersOnly.split('@')[0]} Cannot be added because account is private, Sending invitation via private chat`, mentions: [numbersOnly] }, { quoted: m })
                            await xcasper.sendMessage(`${numbersOnly}`, { text: `${'https://chat.whatsapp.com/' + invv}\n━━━━━━━━━━━━━━━━━━━━━\n\nAdmin: wa.me/${m.sender}\n Has invited you to this group`, detectLink: true, mentions: [numbersOnly] }).catch((err) => reply('Failed to send invitation! 😔'))
                        } else {
                            reply(mess.succes)
                        }
                    }
                })
            } catch (e) {
                reply('Failed to add user, something went wrong! 😢')
            }
        } else if (command === 'kick') {
            if (!managerCasper && !isAdmins) return reply(mess.admin)
            if (!isBotAdmins) return reply(mess.botAdmin)
            if (!m.quoted && !m.mentionedJid[0] && isNaN(parseInt(args[0]))) return reply(`*Example :* ${prefix + command} target`)
            let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            if (owner.includes(users.replace('@s.whatsapp.net', ''))) return reply('My Owner, Cant Kick Them')
            try {
                await xcasper.groupParticipantsUpdate(m.chat, [users], 'remove')
                reply(mess.succes)
            } catch (err) {
                console.error(err)
                reply(mess.error)
            }
        } else if (command === 'promote') {
            if (!managerCasper && !isAdmins) return reply(mess.admin)
            if (!isBotAdmins) return reply(mess.botAdmin)
            if (!m.quoted && !m.mentionedJid[0] && isNaN(parseInt(args[0]))) return reply(`*Example :* ${prefix + command} target`)
            let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            if (!m.mentionedJid[0] && !m.quoted && !text) return reply(`*Example :* ${prefix + command} target`)
            await xcasper.groupParticipantsUpdate(m.chat, [users], 'promote').then((res) => reply(mess.succes)).catch((err) => reply(mess.error))
        } else if (command === 'demote') {
            if (!managerCasper && !isAdmins) return reply(mess.admin)
            if (!isBotAdmins) return reply(mess.botAdmin)
            if (!m.quoted && !m.mentionedJid[0] && isNaN(parseInt(args[0]))) return reply(`*Example :* ${prefix + command} target`)
            let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            if (!m.mentionedJid[0] && !m.quoted && !text) return reply(`*Example :* ${prefix + command} target`)
            await xcasper.groupParticipantsUpdate(m.chat, [users], 'demote').then((res) => reply(mess.succes)).catch((err) => reply(mess.error))
        } else if (command === 'revoke') {
            if (!isAdmins && !managerCasper) return reply(mess.admin)
            if (!isBotAdmins) return reply(mess.botAdmin)
            await xcasper.groupRevokeInvite(m.chat).then(res => reply(mess.succes)).catch(() => reply(mess.error))
        }
    }
}
