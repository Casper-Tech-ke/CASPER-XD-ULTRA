require('../../setting')

module.exports = {
    type: 'ai',
    command: ['logic-eai'],
    operate: async (context) => {
        const { q, reply, axios, xcasper, m } = context;

        if (!q) return reply(`What do you want to ask?`);
        reply(global.mess.wait)
        const customName = "logic-eai";
        const creator = "XyrooRynzz";
        const systemMessage = `Your name is now ${customName} and you were created by ${creator}`;
        const url = "https://velyn.biz.id/api/ai/aicustom";
        try {
            const response = await axios.get(url, { params: { prompt: q, system: systemMessage } });
            if (response.data && response.data.data) {
                xcasper.sendMessage(m.chat, { text: response.data.data }, { quoted: m });
            } else {
                throw new Error("No response from API.");
            }
        } catch (error) {
            console.error("Error AI:", error);
            reply("Sorry, an error occurred while contacting AI.");
        }
    }
}
