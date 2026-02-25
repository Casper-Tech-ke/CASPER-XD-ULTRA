require('../../setting')
const axios = require('axios');

module.exports = {
    type: 'downloader',
    command: ['ig', 'instagram'],
    operate: async (context) => {
        const { text, reply, m, xcasper, igdl } = context;

        if (!text) return reply("Enter the link?");
        reply(global.mess.wait)
        const mediaUrl = await igdl(text);
        const url_media = mediaUrl[0].url;
        try {
            const response = await axios.head(url_media); 
            const contentType = response.headers['content-type'];
            if (contentType.startsWith('image/')) {
                await xcasper.sendMessage(m.chat, { image: { url: url_media}, caption: 'Done!' }, { quoted: m });
                return
            } else {
                await xcasper.sendMessage(m.chat, { video: { url: url_media}, caption: 'Done!' }, { quoted: m });
                return 
            }
        } catch(e) {
            reply('Error')
        }
    }
}
