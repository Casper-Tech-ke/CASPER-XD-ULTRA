require('../../setting')
const axios = require('axios');

module.exports = {
    type: 'ai',
    command: ['gptlogic'],
    operate: async (context) => {
        const { text, prefix, command, reply, xcasper, m } = context;

        if (!text) return reply(`Example: ${prefix+command} Who is Jokowi`);
        reply(global.mess.wait)
        try {
            let response = await axios.post("https://chateverywhere.app/api/chat/", {
                "model": {
                    "id": "gpt-3.5-turbo-0613", "name": "GPT-3.5", "maxLength": 12000,
                    "tokenLimit": 4000, "completionTokenLimit": 2500, "deploymentName": "gpt-35"
                },
                "messages": [{ "pluginId": null, "content": text, "role": "user" }],
                "prompt": "You are an AI that helps users answer questions accurately.",
                "temperature": 0.5
            }, {
                headers: { "Accept": "/*/", "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36" }
            });
            let result = response.data;
            xcasper.sendMessage(m.chat, { text: result }, { quoted: m });
        } catch (error) {
            console.error("Error fetching data:", error);
            xcasper.sendMessage(m.chat, { text: "An error occurred while processing the request." }, { quoted: m });
        }
    }
}
