require('../../setting')

module.exports = {
    type: 'ai',
    command: ['gemmaai'],
    operate: async (context) => {
        const { text, reply, xcasper, m, fetch } = context;

        if (!text) return reply('Enter your question?');
        reply(global.mess.wait)
        try {
            const res = await fetch(`https://www.velyn.biz.id/api/ai/gemma-2-9b-it?prompt=${encodeURIComponent(text)}`)
            if (res.ok) {
                const json = await res.json()
                if (json.status) {
                    await xcasper.sendMessage(m.chat, { text: json.data }, { quoted: m })
                } else {
                    await xcasper.sendMessage(m.chat, { text: 'Failed to get data from API.' }, { quoted: m })
                }
            } else {
                await xcasper.sendMessage(m.chat, { text: `Status error: ${res.status}` }, { quoted: m })
            }
        } catch (e) {
            await xcasper.sendMessage(m.chat, { text: 'Internal error while processing request.' }, { quoted: m })
            console.error(e)
        }
    }
}
