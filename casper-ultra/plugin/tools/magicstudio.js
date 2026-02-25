module.exports = {
    type: 'tools',
    command: ['magicstudio'],
    operate: async (context) => {
        const { args, prefix, command, reply, xcasper, m, fetch } = context
        if (!args[0]) return reply(`Enter an image prompt!\nExample: ${prefix+command} create an image of a woman holding a cocacola bottle while leaning on a wall`)
        reply(global.mess.wait)
        let prompt = encodeURIComponent(args.join(' '))
        let apiUrl = `https://velyn.biz.id/api/ai/magicStudio?prompt=${prompt}&apikey=velyn`
        try {
            let res = await fetch(apiUrl)
            let contentType = res.headers.get('content-type')
            if (contentType && contentType.startsWith('image')) {
                let buffer = await res.buffer()
                await xcasper.sendFile(m.chat, buffer, 'magicStudio.jpg', `Image created successfully\n${global.packname}`, m)
            } else {
                reply('Failed to get image, API might be down.')
            }
        } catch (e) {
            console.error('Fetch Error:', e)
            reply('An error occurred while contacting API.')
        }
    }
}
