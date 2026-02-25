require('../../setting')
const axios = require('axios');

module.exports = {
    type: 'downloader',
    command: ['mfdl', 'mediafire'],
    operate: async (context) => {
        const { text, reply, m, xcasper, fetchJson } = context;

        if (!text) return reply('Include the mediafire link')
        reply(global.mess.wait)
        try {
            const api = await fetchJson(`https://api.vreden.web.id/api/mediafiredl?url=${encodeURIComponent(text)}`)
            if (!api.status || !api.result || !api.result[0]) return reply('Failed to fetch data from API.')
            const data = api.result[0]
            const fileNama = decodeURIComponent(data.nama || 'file.zip')
            const extension = fileNama.split('.').pop().toLowerCase()
            const res = await axios.get(data.link, { responseType: 'arraybuffer' })
            const media = Buffer.from(res.data)
            let mimetype = ''
            if (extension === 'mp4') mimetype = 'video/mp4'
            else if (extension === 'mp3') mimetype = 'audio/mp3'
            else mimetype = `application/${extension}`
            await xcasper.sendMessage(m.chat, { document: media, fileName: fileNama, mimetype: mimetype }, { quoted: m })
        } catch (err) {
            console.error(err)
            reply('An error occurred while downloading: ' + err.message)
        }
    }
}
