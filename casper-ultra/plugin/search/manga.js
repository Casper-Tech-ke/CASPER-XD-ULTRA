require('../../setting')

module.exports = {
    type: 'search',
    command: ['mangainfo', 'mangadetail'],
    operate: async (context) => {
        const { command, args, text, prefix, reply, xcasper, m, komiku, detail } = context
        if (command === 'mangainfo') {
            const mangaName = args.join(' ')
            if (!mangaName) return reply(`*Example :*\n\n${prefix + command} Anime`)
            reply(global.mess.wait)
            try {
                const mangaList = await komiku("manga", mangaName)
                if (mangaList.length === 0) return reply('_[ Invalid ]_ Not Found !!')
                let captionText = `📚 *Manga Search Results - ${mangaName}* 📚\n\n`
                mangaList.slice(0, 5).forEach((manga, index) => {
                    captionText += `📖 *${index + 1}. ${manga.title}*\n`
                    captionText += `🗂️ *Genre*: ${manga.genre}\n`
                    captionText += `🔗 *Url*: ${manga.url}\n`
                    captionText += `📖 *Description*: ${manga.description}\n\n`
                })
                await reply(captionText)
            } catch (error) {
                console.error("Report Error :", error)
                reply(global.mess.error)
            }
        } else if (command === 'mangadetail') {
            const url = args[0]
            if (!url) return reply(`*Example :*\n\n${prefix + command} URL`)
            reply(global.mess.wait)
            try {
                const mangaDetail = await detail(url)
                let captionText = `📚 *Manga Detail* 📚\n\n`
                captionText += `📖 *Title*: ${mangaDetail.title}\n`
                captionText += `🗂️ *Genre*: ${mangaDetail.genres.join(', ')}\n`
                captionText += `📖 *Description*: ${mangaDetail.description}\n`
                captionText += `📅 *First Chapter*: ${mangaDetail.awalChapter}\n`
                captionText += `📅 *Latest Chapter*: ${mangaDetail.newChapter}\n`
                xcasper.sendMessage(m.chat, { image: { url: mangaDetail.coverImage }, caption: captionText }, { quoted: m })
            } catch (error) {
                console.error("Report Error :", error)
                reply(global.mess.error)
            }
        }
    }
}
