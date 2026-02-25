module.exports = {
    type: 'ai',
    command: ['lumin-ai'],
    operate: async (context) => {
        const { q, reply } = context;

        if (!q) return reply(`How can I help you?`);
        reply(global.mess.wait)
        try {
            if (typeof Eai === 'undefined') return reply('Eai function is not available.');
            const aliceeai = await Eai(q);
            if (!aliceeai) return reply("No Response");
            await reply(`${aliceeai}\n\n${global.packname || ''}`);
        } catch (error) {
            console.error("Error while getting data:", error.message);
            reply("An error occurred while processing the request.");
        }
    }
}
