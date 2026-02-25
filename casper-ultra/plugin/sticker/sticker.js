module.exports = {
    type: 'sticker',
    command: ['sticker', 'stiker', 's'],
    operate: async (context) => {
        const { quoted, prefix, command, reply, xcasper, m, mime } = context
        if (!quoted) return reply(`Reply to a Video/Image with caption ${prefix + command}`)
        reply(global.mess.wait)
        if (/image/.test(mime)) {
            let media = await quoted.download()
            let encmedia = await xcasper.sendImageAsSticker(m.chat, media, m, { packname: global.packname, author: global.author })
        } else if (/video/.test(mime)) {
            if ((quoted.msg || quoted).seconds > 31) return reply('Maximum 30 seconds!')
            let media = await quoted.download()
            let encmedia = await xcasper.sendVideoAsSticker(m.chat, media, m, { packname: global.packname, author: global.author })
        } else {
            return reply(`Send an Image/Video with caption ${prefix + command}\nVideo duration 1-9 seconds`)
        }
    }
}
