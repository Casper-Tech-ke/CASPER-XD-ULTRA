module.exports = {
    type: 'ai',
    command: ['ai'],
    operate: async (context) => {
        const { text, reply, axios, m } = context;

        if (!text) return reply(`What do you want to ask?`);
        reply(global.mess.wait)
        const prompt = `You are an AI with extraordinary intelligence, you love helping others, and your speaking style is very polite`
        const requestData = { content: text, user: m.sender, prompt: prompt };
        const quotedMsg = m && (m.quoted || m);
        try {
            let response;
            const mimetype = quotedMsg?.mimetype || quotedMsg?.msg?.mimetype;
            if (mimetype && /image/.test(mimetype)) {
                requestData.imageBuffer = await quotedMsg.download();
            }
            response = (await axios.post('https://luminai.my.id', requestData)).data.result;
            reply(response);
        } catch (err) {
            reply(err.toString());
        }
    }
}
