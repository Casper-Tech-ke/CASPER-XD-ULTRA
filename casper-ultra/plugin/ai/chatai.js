require('../../setting')

module.exports = {
    type: 'ai',
    command: ['chatai'],
    operate: async (context) => {
        const { args, reply, axios } = context;

        try {
            if (!args.length) return reply('Enter your question')
            reply(global.mess.wait)
            let payload = { messages: [{ role: 'user', content: args.join(' ') }] }
            let headers = { headers: { Origin: 'https://chatai.org', Referer: 'https://chatai.org/' } }
            let { data } = await axios.post('https://chatai.org/api/chat', payload, headers)
            reply(data?.content || 'No answer available')
        } catch (e) {
            reply(e.message)
        }
    }
}
