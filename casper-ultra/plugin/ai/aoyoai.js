require('../../setting')
const axios = require('axios');

module.exports = {
    type: 'ai',
    command: ['aoyoai'],
    operate: async (context) => {
        const { text, reply } = context;

        if (!text) return reply('Enter your question?');
        reply(global.mess.wait)
        try {
            let { data } = await axios.get(`https://www.abella.icu/aoyoai?q=${encodeURIComponent(text)}`);
            if (data?.status !== 'success') throw 'Failed to get response from Web';
            let res = data?.data?.response;
            if (!res) throw 'Response not found';
            reply(res);
        } catch (e) {
            reply('Error');
        }
    }
}
