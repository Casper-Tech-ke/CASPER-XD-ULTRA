require('../../setting')

module.exports = {
    type: 'search',
    command: ['otakudesu'],
    operate: async (context) => {
        const { xcasper, m, otakuDesu } = context
        let data = await otakuDesu.ongoing()
        let captionText = `「 *ANIME SCHEDULE* 」\n\n`
        for (let i of data) {
            captionText += `*💬 Title*: ${i.title}\n`
            captionText += `*📺 Eps*: ${i.episode}\n`
            captionText += `*🔗 URL*: ${i.link}\n\n`
        }
        xcasper.sendMessage(m.chat, {
            text: captionText,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999999, isForwarded: true,
                forwardedNewsletterMessageInfo: { newsletterName: global.newsletterName, newsletterJid: global.idch },
                externalAdReply: {
                    showAdAttribution: true, title: 'Latest Anime Updates!', mediaType: 1, previewType: 1,
                    body: 'Hello 👋', thumbnailUrl: global.thumb, renderLargerThumbnail: false,
                    mediaUrl: global.wagc, sourceUrl: global.wagc
                }
            }
        }, { quoted: m })
    }
}
