require('../../setting')

module.exports = {
    type: 'ai',
    command: ['aliceai'],
    operate: async (context) => {
        const { text, prefix, command, reply, xcasper, m, fetch } = context;

        try {
            if (!text) return reply(`Write something after this command.\n\nExample:\n${prefix+command} hi how are you?\n${prefix+command} https://vt.tiktok.com/ZSFxYcCdr/\n${prefix+command} create an image of a woman`)
            reply(global.mess.wait)
            let regexTikTok = /(https?:\/\/)?(www\.|vm\.|vt\.)?tiktok\.com\/[^\s]+/gi
            let isTikTok = regexTikTok.test(text)
            let isImageReq = /(gambar|buatkan.*gambar|bikin.*gambar|buat.*gambar)/i.test(text)
            if (isTikTok) {
                let link = text.match(regexTikTok)[0]
                let res = await fetch(`https://www.velyn.biz.id/api/downloader/tiktok?url=${encodeURIComponent(link)}`)
                let json = await res.json()
                if (!json?.status || !json?.data?.no_watermark) return reply(`❌ Error\nLogs error: Failed to download TikTok video.`)
                let prompt = `Create an interesting caption for a TikTok video titled: ${json?.data?.title || 'untitled'}`
                let aiRes = await fetch(`https://www.velyn.biz.id/api/ai/velyn-1.0-1b?prompt=${encodeURIComponent(prompt)}`)
                let aiJson = await aiRes.json()
                if (!aiJson?.status || !aiJson?.result) return reply(`❌ Error\nLogs error: Failed to get caption from AI.`)
                await xcasper.sendMessage(m.chat, { video: { url: json.data.no_watermark }, caption: aiJson.result.toString() }, { quoted: m })
            } else if (isImageReq) {
                let prompt = text
                let res = await fetch(`https://www.velyn.biz.id/api/ai/text2img?prompt=${encodeURIComponent(prompt)}`)
                if (!res.ok) return reply(`❌ Error\nLogs error: Failed to contact image service.`)
                let buffer = await res.buffer()
                await xcasper.sendMessage(m.chat, { image: buffer, caption: `Here is the image result for prompt:\n*${prompt}*` }, { quoted: m })
            } else {
                let prompt = text
                let res = await fetch(`https://www.velyn.biz.id/api/ai/velyn-1.0-1b?prompt=${encodeURIComponent(prompt)}`)
                let json = await res.json()
                if (!json?.status || !json?.result) throw `❌ Error\nLogs error: Failed to get AI response.`
                reply(json.result.toString())
            }
        } catch (e) {
            console.error(e)
            return reply(`❌ Error\nLogs error: ${(e?.message || e).toString()}`)
        }
    }
}
