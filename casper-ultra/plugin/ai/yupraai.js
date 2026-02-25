require('../../setting')
const axios = require('axios');

module.exports = {
    type: 'ai',
    command: ['yupraai'],
    operate: async (context) => {
        const { text, reply, m } = context;

        if (!text) return reply('Enter your question?');
        reply(global.mess.wait)
        const timestamp = Date.now();
        const sessionId = m.chat;
        const encodedText = encodeURIComponent(text);
        const url = `https://api.yupradev.biz.id/ai/ypai?text=${encodedText}&t=${timestamp}&session=${sessionId}`;
        try {
            const res = await axios.get(url, {
                headers: {
                    authority: 'api.yupradev.biz.id', accept: '*/*',
                    origin: 'https://ai.yupradev.biz.id', referer: 'https://ai.yupradev.biz.id/',
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
                }
            });
            const data = res.data;
            const replyText = data.response || data.result || JSON.stringify(data);
            await reply(replyText.trim());
        } catch (err) {
            console.error(err);
            await reply('❌ Failed to reach API');
        }
    }
}
