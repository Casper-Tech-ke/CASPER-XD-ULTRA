module.exports = {
    type: 'ai',
    command: ['muslimai'],
    operate: async (context) => {
        const { text, reply } = context;

        if (!text) return reply('Enter your question?');
        reply(global.mess.wait)
        try {
            if (typeof muslimai === 'undefined') return reply('muslimai function is not available.');
            const result = await muslimai(text);
            if (result.error) return reply(result.error);
            let sourcesText = result.sources.length > 0
                ? result.sources.map((src, index) => `${index + 1}. *${src.title}*\n🔗 ${src.url}`).join("\n\n")
                : "No sources found.";
            let responseMessage = `ᴘᴏᴡᴇʀᴇᴅ ᴡɪᴛʜ ᴍᴜsʟɪᴍᴀɪ\n\n${result.answer}`;
            reply(responseMessage);
        } catch (error) {
            console.error("⚠ *Error* :", error);
            reply("An error occurred.");
        }
    }
}
