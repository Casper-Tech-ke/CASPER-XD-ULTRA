require('../../setting')

module.exports = {
    type: 'search',
    command: ['wikimedia'],
    operate: async (context) => {
        const { text, prefix, command, reply, wikimedia } = context
        if (!text) return reply(`*Example :*\n\n${prefix + command} Query`)
        reply(global.mess.wait)
        try {
            const results = await wikimedia(text)
            if (results.length === 0) return reply(`⚠️ No images found on Wikimedia with the keyword "${text}"! 🥲`)
            let result = results.map(img => `🖼️ *${img.title || 'No Title'}*\n🔗 ${img.source}`).join('\n\n')
            reply(`🌐 *Wikimedia Search Results for*: ${text}\n\n${result}`)
        } catch (err) {
            console.error(err)
            reply(`❌ There was a problem fetching images from Wikimedia! Try again later 🥺`)
        }
    }
}
