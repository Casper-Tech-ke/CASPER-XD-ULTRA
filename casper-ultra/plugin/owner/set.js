module.exports = {
    type: 'owner',
    command: ['set', 'setprefix', 'setbotname', 'setowner', 'setauthor', 'setpackname'],
    operate: async (context) => {
        const { isOwner, reply, prefix, command, text, args } = context

        if (!isOwner) return reply(global.mess.OnlyOwner)

        if (command === 'setprefix') {
            if (!text) return reply(`📌 Current prefix: *${global.prefix}*\n\nUsage: ${prefix}setprefix <character>\nExample: ${prefix}setprefix .`)
            const newPrefix = [...text.trim()][0]
            if (!newPrefix) return reply('❌ Provide a valid character.')
            global.prefix = newPrefix
            global.db.settings.set('prefix', newPrefix)
            return reply(`✅ Prefix changed to: *${newPrefix}*\n\nUse commands like: *${newPrefix}menu*`)
        }

        if (command === 'setbotname') {
            if (!text) return reply(`🤖 Current bot name: *${global.botname}*\n\nUsage: ${prefix}setbotname <name>\nExample: ${prefix}setbotname My Cool Bot`)
            const newName = text.trim()
            global.botname = newName
            global.packname = newName
            global.db.settings.set('botname', newName)
            global.db.settings.set('packname', newName)
            return reply(`✅ Bot name changed to: *${newName}*\nSticker pack name also updated.`)
        }

        if (command === 'setowner') {
            if (!text) return reply(`👑 Current owner: *${global.ownername}*\n\nUsage: ${prefix}setowner <name>\nExample: ${prefix}setowner John`)
            const newOwner = text.trim()
            global.ownername = newOwner
            global.db.settings.set('ownername', newOwner)
            return reply(`✅ Owner name changed to: *${newOwner}*`)
        }

        if (command === 'setauthor') {
            if (!text) return reply(`✍️ Current sticker author: *${global.author}*\n\nUsage: ${prefix}setauthor <name>\nExample: ${prefix}setauthor MyName`)
            const newAuthor = text.trim()
            global.author = newAuthor
            global.db.settings.set('author', newAuthor)
            return reply(`✅ Sticker author changed to: *${newAuthor}*`)
        }

        if (command === 'setpackname') {
            if (!text) return reply(`📦 Current sticker pack: *${global.packname}*\n\nUsage: ${prefix}setpackname <name>\nExample: ${prefix}setpackname Cool Stickers`)
            const newPack = text.trim()
            global.packname = newPack
            global.db.settings.set('packname', newPack)
            return reply(`✅ Sticker pack name changed to: *${newPack}*`)
        }

        if (command === 'set') {
            if (!args[0]) {
                return reply(`⚙️ *Bot Settings*\n\n` +
                    `📌 *Prefix:* ${global.prefix}\n` +
                    `🤖 *Bot Name:* ${global.botname}\n` +
                    `👑 *Owner:* ${global.ownername}\n` +
                    `✍️ *Sticker Author:* ${global.author}\n` +
                    `📦 *Sticker Pack:* ${global.packname}\n` +
                    `🌍 *Timezone:* ${global.botTimezone}\n` +
                    `🔒 *Mode:* ${global.botMode}\n\n` +
                    `*Available commands:*\n` +
                    `• ${prefix}setprefix <char>\n` +
                    `• ${prefix}setbotname <name>\n` +
                    `• ${prefix}setowner <name>\n` +
                    `• ${prefix}setauthor <name>\n` +
                    `• ${prefix}setpackname <name>\n\n` +
                    `Or use: ${prefix}set <key> <value>\n` +
                    `Keys: prefix, botname, owner, author, packname`)
            }

            const key = args[0].toLowerCase()
            const value = args.slice(1).join(' ').trim()

            switch (key) {
                case 'prefix': {
                    if (!value) return reply(`📌 Current prefix: *${global.prefix}*`)
                    const newPrefix = [...value][0]
                    global.prefix = newPrefix
                    global.db.settings.set('prefix', newPrefix)
                    return reply(`✅ Prefix changed to: *${newPrefix}*`)
                }
                case 'botname':
                case 'name':
                case 'bot': {
                    if (!value) return reply(`🤖 Current bot name: *${global.botname}*`)
                    global.botname = value
                    global.packname = value
                    global.db.settings.set('botname', value)
                    global.db.settings.set('packname', value)
                    return reply(`✅ Bot name changed to: *${value}*\nSticker pack name also updated.`)
                }
                case 'owner': {
                    if (!value) return reply(`👑 Current owner: *${global.ownername}*`)
                    global.ownername = value
                    global.db.settings.set('ownername', value)
                    return reply(`✅ Owner name changed to: *${value}*`)
                }
                case 'author': {
                    if (!value) return reply(`✍️ Current sticker author: *${global.author}*`)
                    global.author = value
                    global.db.settings.set('author', value)
                    return reply(`✅ Sticker author changed to: *${value}*`)
                }
                case 'packname':
                case 'pack': {
                    if (!value) return reply(`📦 Current sticker pack: *${global.packname}*`)
                    global.packname = value
                    global.db.settings.set('packname', value)
                    return reply(`✅ Sticker pack name changed to: *${value}*`)
                }
                default:
                    return reply(`❌ Unknown setting: *${key}*\n\nAvailable: prefix, botname, owner, author, packname`)
            }
        }
    }
}
