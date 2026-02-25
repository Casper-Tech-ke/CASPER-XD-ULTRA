module.exports = {
    type: 'ai',
    command: ['llama-ai'],
    operate: async (context) => {
        const { text, reply, fetch, xcasper, m } = context;

        let messages = [];
        try {
            if (!text) return reply('Enter your question?');
            let response = await fetch(`https://restapii.rioooxdzz.web.id/api/llama?message=${encodeURIComponent(text)}`);
            reply(global.mess.wait)
            if (!response.ok) throw new Error("Request to OpenAI API failed");
            let result = await response.json();
            await xcasper.sendMessage(m.chat, { text: "" + result.data.response });
            messages = [...messages, { role: "user", content: text }];
        } catch (error) {
            await xcasper.sendMessage(m.chat, { text: "" + `Error: ${error.message}` });
        }
    }
}
