require('../../setting')

module.exports = {
    type: 'ai',
    command: ['feloai'],
    operate: async (context) => {
        const { q, reply, xcasper, m } = context;

        if (!q) return reply('Enter your question?');
        reply(global.mess.wait)
        try {
            let Felo;
            try {
                Felo = require('felo');
            } catch (e) {
                return reply('Felo module is not installed.');
            }
            const licefelo = await Felo(q);
            if (licefelo.error) { reply("*An Error Occurred*"); return; }
            let answer = licefelo.answer || "No answer found.";
            let sources = licefelo.source.length > 0
                ? `*Sources I Used*:\n${licefelo.source.filter(src => src.link).slice(0, 5).map((src, i) => `_${src.link}_`).join("\n\n")}`
                : "-";
            let messg = `ᴘᴏᴡᴇʀᴇᴅ ᴡɪᴛʜ ғᴇʟᴏᴀɪ\n\n${answer}\n\n${sources}`;
            await xcasper.sendMessage(m.chat, { text: messg });
        } catch (error) {
            console.error(error);
            reply("⚠ *An Error Occurred*");
        }
    }
}
