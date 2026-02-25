module.exports = {
    type: 'sticker',
    command: ['qc'],
    operate: async (context) => {
        const { args, m, reply, xcasper, pushname, quote } = context
        let text;
        if (args.length >= 1) {
            text = args.slice(0).join(" ");
        } else if (m.quoted && m.quoted.text) {
            text = m.quoted.text;
        } else {
            return reply("Input text or reply to the text you want to make a quote!");
        }
        if (!text) return reply('Enter text');
        if (text.length > 200) return reply('Maximum 200 characters!');
        reply(global.mess.wait)
        let ppnyauser = await xcasper.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.catbox.moe/nwvkbt.png');
        const rest = await quote(text, pushname, ppnyauser);
        xcasper.sendImageAsSticker(m.chat, rest.result, m, { packname: ``, author: `${global.author}` });
    }
}
