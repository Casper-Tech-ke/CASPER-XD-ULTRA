require('../../setting')
const FormData = require('form-data')

module.exports = {
    type: 'ai',
    command: ['metaai'],
    operate: async (context) => {
        const { text, prefix, command, reply, axios, xcasper, m } = context;

        const MetaAi = {
            chat: async (question) => {
                let d = new FormData();
                d.append("content", `User: ${question}`);
                d.append("model", "@groq/llama-3.1-8b-instant");
                let head = { headers: { ...d.getHeaders() } };
                try {
                    let { data } = await axios.post("https://mind.hydrooo.web.id/v1/chat", d, head);
                    return data.result || data.full_result || JSON.stringify(data);
                } catch (error) {
                    console.error("API Error:", error.response?.data || error.message);
                    throw new Error("Failed to get answer from AI.");
                }
            }
        };
        if (!text) return reply(`Example: ${prefix+command} Who invented football`);
        reply(global.mess.wait)
        try {
            const result = await MetaAi.chat(text);
            await xcasper.sendMessage(m.chat, { text: result }, { quoted: m });
        } catch (error) {
            console.error("Error:", error);
            await reply("Error :v");
        }
    }
}
