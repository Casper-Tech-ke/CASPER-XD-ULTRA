module.exports = {
    type: 'sticker',
    command: ['telestick'],
    operate: async (context) => {
        const { args, reply, xcasper, m, axios, Sticker } = context
        async function telestick(url) {
            const botToken = '7935827856:AAGdbLXArulCigWyi6gqR07gi--ZPm7ewhc'
            const stickerSetName = url.split('/addstickers/')[1]
            let a = await axios.get(`https://api.telegram.org/bot${botToken}/getStickerSet?name=${stickerSetName}`)
            let stickers = await Promise.all(a.data.result.stickers.map(async s => {
                let b = await axios.get(`https://api.telegram.org/bot${botToken}/getFile?file_id=${s.file_id}`)
                return {
                    is_animated: s.is_animated,
                    emoji: s.emoji,
                    image_url: `https://api.telegram.org/file/bot${botToken}/${b.result.file_path}`
                }
            }))
            return { name: a.data.result.name, title: a.data.result.title, sticker_type: a.data.result.sticker_type, stickers }
        }
        try {
            if (!args[0]) return reply('Enter telegram sticker URL')
            let res = await telestick(args[0])
            for (let v of res.stickers) {
                let { data } = await axios.get(v.image_url, { responseType: 'arraybuffer' })
                let sticker = new Sticker(data, { pack: res.title, author: 'MT-BOT', type: v.is_animated ? 'full' : 'default' })
                await xcasper.sendMessage(m.chat, await sticker.toMessage(), { quoted: m })
            }
        } catch (e) {
            reply(e.message)
        }
    }
}
