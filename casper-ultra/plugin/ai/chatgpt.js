require('../../setting')
const axios = require('axios')

module.exports = {
    type: 'ai',
    command: ['chatgpt'],
    operate: async (context) => {
        const { text, reply } = context;

        if (!text) return reply(`Enter your question?`)
        reply(global.mess.wait)
        const model_list = {
            chatgpt4: { api: 'https://stablediffusion.fr/gpt4/predict2', referer: 'https://stablediffusion.fr/chatgpt4' },
            chatgpt3: { api: 'https://stablediffusion.fr/gpt3/predict', referer: 'https://stablediffusion.fr/chatgpt3' }
        };
        try {
            let results = [];
            for (const [model, config] of Object.entries(model_list)) {
                try {
                    const hmm = await axios.get(config.referer);
                    const { data } = await axios.post(config.api, { prompt: text }, {
                        headers: {
                            accept: '*/*',
                            'content-type': 'application/json',
                            origin: 'https://stablediffusion.fr',
                            referer: config.referer,
                            cookie: hmm.headers['set-cookie'].join('; '),
                            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36'
                        }
                    });
                    results.push(`*${model.toUpperCase()}*:\n${data.message || 'No answer available.'}`);
                } catch (err) {
                    results.push(`*${model.toUpperCase()}*:\nFailed to fetch answer.`);
                    console.error(`Error on ${model}:`, err.message);
                }
            }
            reply(results.join('\n\n'));
        } catch (e) {
            console.error(e);
            reply('An error occurred while fetching the answer.');
        }
    }
}
