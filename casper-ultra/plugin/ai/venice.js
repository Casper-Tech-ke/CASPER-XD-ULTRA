require('../../setting')
const axios = require('axios')

module.exports = {
    type: 'ai',
    command: ['venice', 'veniceai'],
    operate: async (context) => {
        const { text, reply, xcasper, m } = context;

        if (!text) return reply(`Enter your question`);
        reply(global.mess.wait)
        try {
            const { data } = await axios.request({
                method: 'POST',
                url: 'https://outerface.venice.ai/api/inference/chat',
                headers: {
                    accept: '*/*',
                    'content-type': 'application/json',
                    origin: 'https://venice.ai',
                    referer: 'https://venice.ai/',
                    'user-agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
                    'x-venice-version': 'interface@20250523.214528+393d253'
                },
                data: JSON.stringify({
                    requestId: 'nekorinn',
                    modelId: 'dolphin-3.0-mistral-24b',
                    prompt: [{ content: text, role: 'user' }],
                    systemPrompt: '',
                    conversationType: 'text',
                    temperature: 0.8,
                    webEnabled: true,
                    topP: 0.9,
                    isCharacter: false,
                    clientProcessingTime: 15
                })
            });
            const chunks = data.split('\n').filter(v => v).map(v => JSON.parse(v));
            const hasil = chunks.map(v => v.content).join('');
            xcasper.sendMessage(m.chat, { text: hasil }, { quoted: m });
        } catch (e) {
            console.error(e.message);
            xcasper.sendMessage(m.chat, { text: 'Sorry, no results from Venice.' }, { quoted: m });
        }
    }
}
