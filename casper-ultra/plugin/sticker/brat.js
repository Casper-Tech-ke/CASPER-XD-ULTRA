module.exports = {
    type: 'sticker',
    command: ['brat'],
    operate: async (context) => {
        const { q, prefix, command, reply, xcasper, m, axios } = context
        if (!q) return reply(`Enter text\n\nExample: ${prefix + command} alok hamil`);
        reply(global.mess.wait)
        let rulz = `https://aqul-brat.hf.space/api/brat?text=${encodeURIComponent(q)}`;
        try {
            const res = await axios.get(rulz, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(res.data, 'binary');
            await xcasper.sendImageAsSticker(m.chat, buffer, m, { packname: ``, author: `${global.author}` });
        } catch (e) {
            console.log(e);
            await reply(`Under maintenance or API error`);
        }
    }
}
