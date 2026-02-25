require('../../setting')

module.exports = {
    type: 'downloader',
    command: ['putar', 'lagu', 'music', 'ytplay', 'play'],
    operate: async (context) => {
        const { text, reply, m, xcasper, yts, fetchJson } = context;

        if (!text) return reply('What song do you want to search?');
        reply(global.mess.wait)
        const ddownr = require('ddownr');
        try {
            let search = await yts(text);
            let firstVideo = search.all[0];
            let response = await ddownr.download(firstVideo.url, 'mp3')
            let hasil = response.downloadUrl
            await xcasper.sendMessage(m.chat, {
                audio: { url: hasil },
                mimetype: 'audio/mp4',
                contextInfo: {
                    externalAdreply: {
                        showAdAttribution: true,
                        title: firstVideo.title || 'Untitled',
                        body: `CASPER-XD ULTRA`,
                        sourceUrl: firstVideo.url,
                        thumbnailUrl: firstVideo.thumbnail || 'https://example.com/default_thumbnail.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
        } catch (e) {
            console.log(e)
            await xcasper.sendMessage(m.chat, { react: { text: '🚫', key: m.key } });
            try {
                let search = await yts(text);
                let firstVideo = search.all[0];
                let memek = await fetchJson(`${global.beta}/api/download/ytmp3?url=${firstVideo.url}&apikey=${global.botz}`);
                let hasil = memek.result;
                await xcasper.sendMessage(m.chat, {
                    audio: { url: hasil.mp3 },
                    mimetype: 'audio/mp4',
                    contextInfo: {
                        externalAdreply: {
                            showAdAttribution: true,
                            title: firstVideo.title || 'Untitled',
                            body: `CASPER-XD ULTRA`,
                            sourceUrl: firstVideo.url,
                            thumbnailUrl: firstVideo.thumbnail || 'https://example.com/default_thumbnail.jpg',
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m });
            } catch (e) {
                console.log(e);
                let search = await yts(text);
                let firstVideo = search.all[0];
                let Xyroo = await fetchJson(`https://api.agatz.xyz/api/ytmp3?url=${firstVideo.url}`);
                await xcasper.sendMessage(m.chat, {
                    audio: { url: Xyroo.data },
                    mimetype: 'audio/mp4',
                    contextInfo: {
                        externalAdreply: {
                            showAdAttribution: true,
                            title: firstVideo.title || 'Untitled',
                            body: `CASPER-XD ULTRA`,
                            sourceUrl: firstVideo.url,
                            thumbnailUrl: firstVideo.thumbnail || 'https://example.com/default_thumbnail.jpg',
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m });
            }
        }
    }
}
