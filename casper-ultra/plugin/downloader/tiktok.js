require('../../setting')

module.exports = {
    type: 'downloader',
    command: ['tt', 'tiktok'],
    operate: async (context) => {
        const { text, reply, m, xcasper, prefix, command, fg } = context;

        if (!text) return reply(`Example: ${prefix + command} link`)
        reply(global.mess.wait)
        let data = await fg.tiktok(text)
        let json = data.result
        let caption = `[ TIKTOK - DOWNLOAD ]\n\n`
        caption += `◦ *Id* : ${json.id}\n`
        caption += `◦ *Username* : ${json.author.nickname}\n`
        caption += `◦ *Title* : ${(json.title)}\n`
        caption += `◦ *Like* : ${(json.digg_count)}\n`
        caption += `◦ *Comments* : ${(json.comment_count)}\n`
        caption += `◦ *Share* : ${(json.share_count)}\n`
        caption += `◦ *Play* : ${(json.play_count)}\n`
        caption += `◦ *Created* : ${json.create_time}\n`
        caption += `◦ *Size* : ${json.size}\n`
        caption += `◦ *Duration* : ${json.duration}`
        if (json.images) {
            json.images.forEach(async (k) => {
                await xcasper.sendMessage(m.chat, { image: { url: k }}, { quoted: m });
            })
        } else {
            xcasper.sendMessage(m.chat, { video: { url: json.play }, mimetype: 'video/mp4', caption: caption }, { quoted: m })
            setTimeout(() => {
                xcasper.sendMessage(m.chat, { audio: { url: json.music }, mimetype: 'audio/mpeg' }, { quoted: m })
            }, 3000)
        }
    }
}
