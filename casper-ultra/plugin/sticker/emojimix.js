module.exports = {
    type: 'sticker',
    command: ['emojimix'],
    operate: async (context) => {
        const { text, prefix, command, reply, xcasper, m } = context
        if (!text) return reply(`example : 😎+😂 or 😎|😂`);
        const emojis = text.split(/[\+\|]/);
        if (emojis.length !== 2) return reply('Please enter two valid emojis, example: 😎+😂 or 😎|😂');
        reply(global.mess.wait)
        const text1 = emojis[0].trim();
        const text2 = emojis[1].trim();
        let api = `https://fastrestapis.fasturl.cloud/maker/emojimix?emoji1=${text1}&emoji2=${text2}`;
        await xcasper.sendImageAsSticker(m.chat, api, m, { packname: '', author: `${global.packname}` });
    }
}
