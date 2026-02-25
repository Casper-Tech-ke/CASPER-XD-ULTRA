require('../../setting')

module.exports = {
    type: 'search',
    command: ['infogempa', 'infobmkg', 'gempa', 'bmkg'],
    operate: async (context) => {
        const { reply, xcasper, m, fetchJson } = context
        reply(global.mess.wait)
        try {
            const gempa = require('../../library/scrape/gempa')
            let result = await gempa()
            let gempaData = result.data
            let captionText = `「 *EARTHQUAKE INFO* 」\n\n`
            captionText += `*🌍 Source*: ${result.source}\n`
            captionText += `*📊 Magnitude*: ${gempaData.magnitude.trim()}\n`
            captionText += `*📏 Depth*: ${gempaData.kedalaman.trim()}\n`
            captionText += `*🗺️ Lat & Long*: ${gempaData.lintang_bujur.trim()}\n`
            captionText += `*🕒 Time*: ${gempaData.waktu.trim()}\n`
            captionText += `*📍 Region*: ${gempaData.wilayah.trim() || 'No data'}\n`
            captionText += `*😱 Felt*: ${gempaData.dirasakan.trim() || 'No data'}\n\n`
            captionText += `Stay alert and follow official instructions!`
            if (gempaData.imagemap) {
                xcasper.sendMessage(m.chat, { image: { url: gempaData.imagemap.startsWith('http') ? gempaData.imagemap : `https://www.bmkg.go.id${gempaData.imagemap}` }, caption: captionText }, { quoted: m })
            } else {
                xcasper.sendMessage(m.chat, { text: captionText }, { quoted: m })
            }
        } catch (error) {
            console.error("Report Error :", error)
            reply(global.mess.error)
        }
    }
}
