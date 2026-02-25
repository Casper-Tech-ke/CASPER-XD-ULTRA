require('../../setting')
const axios = require('axios');

module.exports = {
    type: 'ai',
    command: ['blackbox-pro'],
    operate: async (context) => {
        const { text, reply } = context;

        if (!text) return reply('Enter your question?');
        reply(global.mess.wait)
        try {
            let { data } = await axios.get('https://www.abella.icu/blackbox-pro?q=' + encodeURIComponent(text));
            if (data?.status !== 'success') return reply('Failed to fetch answer.');
            reply(data.data.answer.result);
        } catch {
            reply('Error');
        }
    }
}
