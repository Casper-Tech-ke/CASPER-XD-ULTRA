require('../../setting')

module.exports = {
    type: 'downloader',
    command: ['fb', 'fbdl', 'facebook'],
    operate: async (context) => {
        const { text, reply, m, xcasper, fdown } = context;

        if (!text) return reply('Facebook URL?')
        reply(global.mess.wait)
        try {
            let res = await fdown.download(text);
            if (res && res.length > 0) {
                let videoData = res[0]; 
                let videoUrl = videoData.hdQualityLink || videoData.normalQualityLink; 
                if (videoUrl) {
                    let caption = `*Title:* ${videoData.title}\n*Description:* ${videoData.description}\n*Duration:* ${videoData.duration}`;
                    await xcasper.sendMessage(m.chat, { video: { url: videoUrl }, caption: caption, mimetype: 'video/mp4' }, { quoted: m });
                }
            } else {
                return reply(global.mess.error)
            }
        } catch (e) {
            console.log(e);
            reply('Error')
        }
    }
}
