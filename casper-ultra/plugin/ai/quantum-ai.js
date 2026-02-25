require('../../setting')

module.exports = {
    type: 'ai',
    command: ['quantum-ai'],
    operate: async (context) => {
        const { text, prefix, command, reply, fetch } = context;

        if (!text) return reply(`Example:\n${prefix+command} what is artificial intelligence?`)
        reply(global.mess.wait)
        try {
            const api = `https://zelapioffciall.vercel.app/ai/quantum?text=${encodeURIComponent(text)}`
            const res = await fetch(api)
            if (!res.ok) throw await res.text()
            const json = await res.json()
            if (!json.result) return reply('❌ Failed to get AI response.')
            reply(json.result)
        } catch (e) {
            console.error('[QUANTUM AI ERROR]', e)
            reply('❌ An error occurred while fetching response from Quantum AI.')
        }
    }
}
