require('../../setting')

module.exports = {
    type: 'search',
    command: ['kusonimeinfo', 'animeinfo', 'kusonimesearch', 'animesearch'],
    operate: async (context) => {
        const { command, text, prefix, reply, Kusonime } = context
        if (command === 'kusonimeinfo' || command === 'animeinfo') {
            try {
                const animeList = await Kusonime.info()
                if (animeList.length === 0) return reply('_[ Invalid ⚠️ ]_ No latest anime data found at this time.')
                reply(global.mess.wait)
                let captionText = `🎌 *Latest Anime from Kusonime* 🎌\n\n`
                animeList.slice(0, 5).forEach((anime, index) => {
                    captionText += `📺 *${index + 1}. ${anime.title}*\n`
                    captionText += `🔗 *URL*: ${anime.url}\n`
                    captionText += `🗂️ *Genre*: ${anime.genres.join(', ')}\n`
                    captionText += `📅 *Release*: ${anime.releaseTime}\n\n`
                })
                await reply(captionText)
            } catch (error) {
                console.error("Report Error :", error)
                reply(global.mess.error)
            }
        } else {
            if (!text) return reply(`*Example :*\n\n${prefix + command} Anime`)
            reply(global.mess.wait)
            try {
                const searchResults = await Kusonime.search(text)
                if (typeof searchResults === 'string') return reply(`⚠️ ${searchResults}`)
                let captionText = `🔍 *Search Results for*: ${text}\n\n`
                searchResults.slice(0, 5).forEach((anime, index) => {
                    captionText += `📺 *${index + 1}. ${anime.title}*\n`
                    captionText += `🔗 *URL*: ${anime.url}\n`
                    captionText += `🗂️ *Genre*: ${anime.genres.join(', ')}\n`
                    captionText += `📅 *Release*: ${anime.releaseTime}\n\n`
                })
                await reply(captionText)
            } catch (error) {
                console.error("Report Error :", error)
                reply(global.mess.error)
            }
        }
    }
}
