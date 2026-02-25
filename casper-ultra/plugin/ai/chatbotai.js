require('../../setting')
const axios = require('axios');

module.exports = {
    type: 'ai',
    command: ['chatbotai'],
    operate: async (context) => {
        const { text, reply } = context;

        if (!text) return reply('Enter your question?');
        reply(global.mess.wait)
        try {
            let { data } = await axios.get(`https://www.abella.icu/onlinechatbot?q=${encodeURIComponent(text)}`);
            if (data?.data?.answer?.data) {
                reply(data.data.answer.data);
            } else {
                reply('Unable to find an answer from AI.');
            }
        } catch (e) {
            reply('An error occurred while fetching the answer.');
        }
    }
}
