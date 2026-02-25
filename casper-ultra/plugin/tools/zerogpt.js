module.exports = {
    type: 'tools',
    command: ['zerogpt'],
    operate: async (context) => {
        const { q, reply, axios } = context
        if (!q) return reply('Enter your question?')
        reply(global.mess.wait)
        try {
            const id = () => Math.random().toString(36).slice(2, 18)
            const res = await axios.post('https://zerogptai.org/wp-json/mwai-ui/v1/chats/submit', {
                botId: "default", customId: null, session: "N/A", chatId: id(), contextId: 39,
                messages: [], newMessage: q, newFileId: null, stream: true
            }, {
                headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': 'e7b64e1953', 'Accept': 'text/event-stream' },
                responseType: 'stream'
            })
            let out = ''
            res.data.on('data', chunk => {
                chunk.toString().split('\n').forEach(line => {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6))
                        if (data.type === 'live') out += data.data
                        if (data.type === 'end') reply(out.trim())
                    }
                })
            })
        } catch (e) {
            reply('Error: ' + e.message)
        }
    }
}
