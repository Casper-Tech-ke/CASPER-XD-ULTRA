require('../../setting')

module.exports = {
    type: 'search',
    command: ['jkt48news'],
    operate: async (context) => {
        const { args, reply, jktNews } = context
        const lang = args[0] || "id"
        reply(global.mess.wait)
        try {
            const news = await jktNews(lang)
            if (news.length === 0) return reply('_[ Report ]_ No News Find')
            let captionText = `🎤 *Latest JKT48 News* 🎤\n\n`
            news.slice(0, 5).forEach((item, index) => {
                captionText += `📰 *${index + 1}. ${item.title}*\n`
                captionText += `📅 *Date*: ${item.date}\n`
                captionText += `🔗 *Link*: ${item.link}\n\n`
            })
            await reply(captionText)
        } catch (error) {
            console.error("Report Error :", error)
            reply(global.mess.error)
        }
    }
}
