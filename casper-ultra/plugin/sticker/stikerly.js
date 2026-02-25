module.exports = {
    type: 'sticker',
    command: ['stikerly'],
    operate: async (context) => {
        const { text, prefix, command, reply, xcasper, m, fetch, Sticker } = context
        if (!text) return reply(`*Example :*\n\n ${prefix + command} anomali `)
        reply(global.mess.wait)
        try {
            const searchRes = await fetch(`https://zenzxz.dpdns.org/search/stickerlysearch?query=${encodeURIComponent(text)}`)
            const searchJson = await searchRes.json()
            if (!searchJson.status || !Array.isArray(searchJson.data) || searchJson.data.length === 0) {
                return reply('*Not Found 🚫*')
            }
            const pick = searchJson.data[Math.floor(Math.random() * searchJson.data.length)]
            const detailUrl = `https://zenzxz.dpdns.org/tools/stickerlydetail?url=${encodeURIComponent(pick.url)}`
            const detailRes = await fetch(detailUrl)
            const detailJson = await detailRes.json()
            if (!detailJson.status || !detailJson.data || !Array.isArray(detailJson.data.stickers) || detailJson.data.stickers.length === 0) {
                return reply('Error while fetching sticker details')
            }
            reply(`Sending ${detailJson.data.stickers.length} Sticker`)
            let maxSend = 10
            for (let i = 0; i < Math.min(detailJson.data.stickers.length, maxSend); i++) {
                const img = detailJson.data.stickers[i]
                let sticker = new Sticker(img.imageUrl, { pack: global.packname, author: global.author, type: 'full', categories: ['Anomali'], id: 'CasperXD' })
                let buffer = await sticker.toBuffer()
                await xcasper.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
            }
        } catch (e) {
            console.error(e)
            reply(global.mess.error)
        }
    }
}
