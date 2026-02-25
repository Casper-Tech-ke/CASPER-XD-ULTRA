const axios = require('axios')
const { sendCarousel } = require('../../library/sendButtons')
const { createSearchCard } = require('../../library/canvas')
const { writeExifImg, writeExifVid } = require('../../library/lib/exif')
const fs = require('fs')
const path = require('path')

const API = 'https://apis.xcasper.space/api/search'
const FOOTER = '🔍 CASPER-XD ULTRA Search'

function btn(displayText, id) {
    return { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: displayText, id }) }
}
function urlBtn(displayText, url) {
    return { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: displayText, url }) }
}
function copyBtn(url) {
    if (!url) return null
    return { name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: '📋 Copy URL', copy_code: url }) }
}

async function buildCarousel(xcasper, from, m, items, options = {}) {
    const { type = 'web', bodyText = '', footerText = FOOTER, cardBuilder } = options
    const cards = []
    const tmpFiles = []
    for (let i = 0; i < Math.min(items.length, 10); i++) {
        const item = items[i]
        const { title, subtitle, buttons: cardBtns, imageUrl } = cardBuilder(item, i)
        let cardImage
        if (imageUrl) {
            cardImage = imageUrl
        } else {
            const imgBuf = createSearchCard(title || `Result ${i + 1}`, '', { type, index: i })
            const tmpFile = path.join('/tmp', `search_card_${Date.now()}_${i}.png`)
            fs.writeFileSync(tmpFile, imgBuf)
            cardImage = tmpFile
            tmpFiles.push(tmpFile)
        }
        cards.push({
            title: '',
            text: subtitle ? `*${title || `Result ${i + 1}`}*\n${subtitle}` : (title || `Result ${i + 1}`),
            footer: footerText,
            image: cardImage,
            buttons: cardBtns || []
        })
    }

    try {
        await sendCarousel(xcasper, from, {
            text: bodyText,
            footer: footerText,
            cards
        }, { quoted: m })
    } catch (err) {
        console.log('Carousel fallback:', err.message)
        let fallback = bodyText + '\n\n'
        for (let i = 0; i < Math.min(items.length, 10); i++) {
            const { title, subtitle } = options.cardBuilder(items[i], i)
            fallback += `*${i + 1}. ${title}*\n${subtitle || ''}\n\n`
        }
        await xcasper.sendMessage(from, { text: fallback.trim() }, { quoted: m })
    }

    for (const f of tmpFiles) {
        try { fs.unlinkSync(f) } catch {}
    }
}

module.exports = {
    type: 'search',
    command: [
        'google', 'websearch', 'googleimage', 'gimages', 'gimg',
        'ytsearch', 'youtube',
        'spotifysearch', 'spotify',
        'spotifylyrics', 'splyrics',
        'spotifytrack', 'sptrack',
        'spotifyplaylist', 'spplaylist',
        'spotifyrec', 'sprec', 'recommend',
        'applemusic', 'itunes',
        'soundcloud', 'sc',
        'lyrics',
        'googlelyrics', 'glyrics',
        'duckduckgo', 'ddg',
        'brave',
        'shazam',
        'pinterest', 'pin',
        'unsplash',
        'wallpaper', 'wallpapers', 'hdwall',
        'weather', 'cuaca',
        'playstore', 'gplay',
        'happymod',
        'apkpure', 'apk',
        'stickersearch', 'gifsearch',
        'tiktoksearch', 'ttsearch',
        'wattpad'
    ],
    operate: async (context) => {
        const { command, text, args, reply, m, xcasper, prefix, from } = context

        const noQuery = () => reply(`❌ Please provide a search query.\n\nUsage: ${prefix}${command} <query>`)

        try {
            switch (command) {

                case 'google':
                case 'websearch': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/duckduckgo?q=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.results?.length) return reply('❌ No results found.')

                    await buildCarousel(xcasper, from, m, data.results.slice(0, 10), {
                        type: 'google',
                        bodyText: `🔍 *Web Search Results*\n📝 Query: _${text}_`,
                        cardBuilder: (r, i) => ({
                            title: r.title || `Result ${i + 1}`,
                            subtitle: (r.description || '').slice(0, 100),
                            imageUrl: null,
                            buttons: [
                                ...(r.url ? [urlBtn('🌐 Open Link', r.url)] : []),
                                copyBtn(r.url),
                                btn('🦆 DuckDuckGo', `${prefix}ddg ${text}`)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'googleimage':
                case 'gimages':
                case 'gimg': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/google-image?query=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.results?.length) return reply('❌ No images found.')

                    await buildCarousel(xcasper, from, m, data.results.slice(0, 10), {
                        type: 'image',
                        bodyText: `🖼️ *Image Search*\n📝 Query: _${text}_`,
                        cardBuilder: (img, i) => ({
                            title: img.title || `Image ${i + 1}`,
                            subtitle: img.source || '',
                            imageUrl: img.url || img.thumbnail || null,
                            buttons: [
                                ...(img.url ? [urlBtn('🖼️ View Full', img.url)] : []),
                                copyBtn(img.url)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'ytsearch':
                case 'youtube': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/youtube?query=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.videos?.length) return reply('❌ No videos found.')

                    await buildCarousel(xcasper, from, m, data.videos.slice(0, 10), {
                        type: 'youtube',
                        bodyText: `🎬 *YouTube Search*\n📝 Query: _${text}_`,
                        cardBuilder: (v, i) => ({
                            title: v.title || `Video ${i + 1}`,
                            subtitle: `👤 ${v.channel || 'Unknown'} | ⏱️ ${v.duration || ''} | 👀 ${v.views || ''}`,
                            imageUrl: v.thumbnail || v.image || null,
                            buttons: [
                                ...(v.url ? [urlBtn('▶️ Watch', v.url)] : []),
                                copyBtn(v.url)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'spotifysearch':
                case 'spotify': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/spotify-search?q=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.results?.length) return reply('❌ No results found.')

                    await buildCarousel(xcasper, from, m, data.results.slice(0, 10), {
                        type: 'spotify',
                        bodyText: `🎵 *Spotify Search*\n📝 Query: _${text}_`,
                        cardBuilder: (t, i) => ({
                            title: t.title || `Track ${i + 1}`,
                            subtitle: `🎤 ${t.artist || ''} | 💿 ${t.album || ''} | ⏱️ ${t.duration || ''}`,
                            imageUrl: t.thumbnail || null,
                            buttons: [
                                ...(t.url ? [urlBtn('🎵 Listen', t.url)] : []),
                                copyBtn(t.url)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'spotifylyrics':
                case 'splyrics': {
                    if (!text) return reply(`❌ Provide a song name.\n\nUsage: ${prefix}${command} <song name>`)
                    const { data } = await axios.get(`${API}/spotify-lyrics?q=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success) return reply(`❌ ${data.error || 'Lyrics not found.'}`)

                    const track = data.track || {}
                    let msg = `🎵 *${track.title || text}*\n🎤 ${track.artist || 'Unknown'}\n💿 ${track.album || ''}\n\n`

                    if (data.lyrics) {
                        msg += data.lyrics.slice(0, 3000)
                    } else if (data.syncedLyrics) {
                        const lines = data.syncedLyrics.slice(0, 50)
                        for (const l of lines) {
                            msg += `${l.time || ''} ${l.text || l}\n`
                        }
                    } else {
                        msg += '_No lyrics available_'
                    }

                    try {
                        if (track.thumbnail) {
                            await xcasper.sendMessage(from, { image: { url: track.thumbnail }, caption: msg.trim() }, { quoted: m })
                        } else {
                            reply(msg.trim())
                        }
                    } catch { reply(msg.trim()) }
                    return
                }

                case 'spotifytrack':
                case 'sptrack': {
                    if (!text) return reply(`❌ Provide a Spotify URL or track name.\n\nUsage: ${prefix}${command} <url or name>`)
                    const param = text.includes('spotify.com') ? `url=${encodeURIComponent(text)}` : `q=${encodeURIComponent(text)}`
                    const { data } = await axios.get(`${API}/spotify-track?${param}`, { timeout: 15000 })
                    if (!data.success) return reply(`❌ ${data.message || 'Track not found.'}`)

                    const t = data.track || data
                    let msg = `🎵 *${t.title || t.name}*\n🎤 ${t.artist || t.artists?.join(', ')}\n💿 ${t.album}\n⏱️ ${t.duration}\n🔥 Popularity: ${t.popularity || 'N/A'}\n🔗 ${t.url || t.external_url}`

                    try {
                        if (t.thumbnail || t.image) {
                            await xcasper.sendMessage(from, { image: { url: t.thumbnail || t.image }, caption: msg }, { quoted: m })
                        } else {
                            reply(msg)
                        }
                    } catch { reply(msg) }
                    return
                }

                case 'spotifyplaylist':
                case 'spplaylist': {
                    if (!text) return reply(`❌ Provide a Spotify playlist URL.\n\nUsage: ${prefix}${command} <playlist URL>`)
                    const param = text.includes('spotify.com') ? `url=${encodeURIComponent(text)}` : `id=${encodeURIComponent(text)}`
                    const { data } = await axios.get(`${API}/spotify-playlist?${param}`, { timeout: 15000 })
                    if (!data.success) return reply(`❌ ${data.message || 'Playlist not found.'}`)

                    const pl = data.playlist || data
                    const tracks = pl.tracks || data.tracks || []

                    if (tracks.length > 0) {
                        await buildCarousel(xcasper, from, m, tracks.slice(0, 10), {
                            type: 'spotify',
                            bodyText: `🎶 *${pl.name || 'Playlist'}*\n👤 ${pl.owner || ''}\n📊 ${pl.totalTracks || pl.total || '?'} tracks`,
                            cardBuilder: (t, i) => ({
                                title: t.title || t.name || `Track ${i + 1}`,
                                subtitle: `🎤 ${t.artist || t.artists?.join(', ') || ''}`,
                                imageUrl: t.thumbnail || null,
                                buttons: [
                                    ...(t.url ? [urlBtn('🎵 Listen', t.url)] : []),
                                    copyBtn(t.url)
                                ].filter(Boolean)
                            })
                        })
                    } else {
                        let msg = `🎶 *${pl.name || 'Playlist'}*\n👤 ${pl.owner || ''}\n📊 ${pl.totalTracks || pl.total || '?'} tracks\n${pl.description || ''}`
                        reply(msg.trim())
                    }
                    return
                }

                case 'spotifyrec':
                case 'sprec':
                case 'recommend': {
                    if (!text) return reply(`❌ Provide a song/genre for recommendations.\n\nUsage: ${prefix}${command} <song or genre>`)
                    const { data } = await axios.get(`${API}/spotify-recommendations?q=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.tracks?.length) return reply('❌ No recommendations found.')

                    await buildCarousel(xcasper, from, m, data.tracks.slice(0, 10), {
                        type: 'spotify',
                        bodyText: `🎵 *Recommendations based on:* _${text}_`,
                        cardBuilder: (t, i) => ({
                            title: t.title || t.name || `Track ${i + 1}`,
                            subtitle: `🎤 ${t.artist || t.artists?.join(', ') || ''}\n💿 ${t.album || ''}`,
                            imageUrl: t.thumbnail || null,
                            buttons: [
                                ...(t.url ? [urlBtn('🎵 Listen', t.url)] : []),
                                copyBtn(t.url)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'applemusic':
                case 'itunes': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/apple-music?term=${encodeURIComponent(text)}&limit=10`, { timeout: 15000 })
                    if (!data.success) return reply('❌ No results found.')
                    const amResults = [...(data.results?.songs || []), ...(data.results?.artists || [])]
                    if (!amResults.length) return reply('❌ No results found.')

                    await buildCarousel(xcasper, from, m, amResults.slice(0, 10), {
                        type: 'applemusic',
                        bodyText: `🍎 *Apple Music Search*\n📝 Query: _${text}_`,
                        cardBuilder: (t, i) => ({
                            title: t.trackName || t.name || `Result ${i + 1}`,
                            subtitle: t.artistName || t.artist || t.subtitle || t.genre || '',
                            imageUrl: t.artworkUrl100 || t.artwork || null,
                            buttons: [
                                ...(t.trackViewUrl || t.url ? [urlBtn('🍎 Open', t.trackViewUrl || t.url)] : []),
                                copyBtn(t.trackViewUrl || t.url)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'soundcloud':
                case 'sc': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/soundcloud?q=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.tracks?.length) return reply('❌ No tracks found.')

                    await buildCarousel(xcasper, from, m, data.tracks.slice(0, 10), {
                        type: 'soundcloud',
                        bodyText: `🟠 *SoundCloud Search*\n📝 Query: _${text}_`,
                        cardBuilder: (t, i) => {
                            const artist = t.artist?.username || t.artist || 'Unknown'
                            const plays = t.stats?.playbackCount || t.playCount || t.plays || ''
                            return {
                                title: t.title || `Track ${i + 1}`,
                                subtitle: `👤 ${artist} | ⏱️ ${t.duration || ''} | ▶️ ${plays} plays`,
                                imageUrl: t.urls?.artwork || null,
                                buttons: [
                                    ...(t.urls?.permalink ? [urlBtn('🔊 Listen', t.urls.permalink)] : []),
                                    copyBtn(t.urls?.permalink)
                                ].filter(Boolean)
                            }
                        }
                    })
                    return
                }

                case 'lyrics': {
                    if (!text) return reply(`❌ Provide a song name.\n\nUsage: ${prefix}${command} <song name>`)
                    const { data } = await axios.get(`${API}/lyrics?q=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.tracks?.length) return reply('❌ No lyrics found.')

                    const t = data.tracks[0]
                    let msg = `🎵 *${t.trackName || t.name}*\n🎤 ${t.artistName || t.artist}\n💿 ${t.albumName || t.album || ''}\n\n`
                    msg += (t.plainLyrics || t.lyrics || '_No lyrics available_').slice(0, 3500)

                    reply(msg.trim())
                    return
                }

                case 'googlelyrics':
                case 'glyrics': {
                    if (!text) return reply(`❌ Provide a song name.\n\nUsage: ${prefix}${command} <song name>`)
                    const { data } = await axios.get(`${API}/google-lyrics?q=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success) return reply(`❌ ${data.message || 'Lyrics not found.'}`)

                    let msg = `🎵 *${data.title || text}*\n🎤 ${data.artist || 'Unknown'}\n\n`
                    msg += (data.lyrics || '_No lyrics available_').slice(0, 3500)

                    reply(msg.trim())
                    return
                }

                case 'duckduckgo':
                case 'ddg': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/duckduckgo?q=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.results?.length) return reply('❌ No results found.')

                    await buildCarousel(xcasper, from, m, data.results.slice(0, 10), {
                        type: 'duckduckgo',
                        bodyText: `🦆 *DuckDuckGo Search*\n📝 Query: _${text}_`,
                        cardBuilder: (r, i) => ({
                            title: r.title || `Result ${i + 1}`,
                            subtitle: (r.description || '').slice(0, 100),
                            imageUrl: null,
                            buttons: [
                                ...(r.url ? [urlBtn('🌐 Open', r.url)] : []),
                                copyBtn(r.url),
                                btn('🔍 Google', `${prefix}google ${text}`)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'brave': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/brave?q=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.results?.length) return reply('❌ No results found.')

                    await buildCarousel(xcasper, from, m, data.results.slice(0, 10), {
                        type: 'brave',
                        bodyText: `🦁 *Brave Search*\n📝 Query: _${text}_`,
                        cardBuilder: (r, i) => ({
                            title: r.title || `Result ${i + 1}`,
                            subtitle: (r.description || '').slice(0, 100),
                            imageUrl: null,
                            buttons: [
                                ...(r.url ? [urlBtn('🌐 Open', r.url)] : []),
                                copyBtn(r.url),
                                btn('🦆 DuckDuckGo', `${prefix}ddg ${text}`)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'shazam': {
                    const audioUrl = text || ''
                    const quotedMsg = m.quoted

                    if (!audioUrl && !quotedMsg) {
                        return reply(`🎵 *Shazam - Song Recognition*\n\nUsage:\n• ${prefix}shazam <audio URL>\n• Reply to an audio message with ${prefix}shazam`)
                    }

                    if (!audioUrl && quotedMsg) {
                        return reply('❌ Please provide an audio URL. Reply-to-audio is not yet supported via API.')
                    }

                    const { data } = await axios.get(`${API}/shazam?url=${encodeURIComponent(audioUrl)}`, { timeout: 30000 })
                    if (!data.success) return reply(`❌ ${data.message || 'Could not identify the song.'}`)

                    const track = data.track || data
                    let msg = `🎵 *Shazam Result*\n\n`
                    msg += `🎶 *${track.title || 'Unknown'}*\n`
                    msg += `🎤 ${track.artist || track.subtitle || 'Unknown'}\n`
                    if (track.album) msg += `💿 ${track.album}\n`
                    if (track.genre) msg += `🏷️ ${track.genre}\n`

                    try {
                        if (track.thumbnail || track.image || track.coverart) {
                            await xcasper.sendMessage(from, { image: { url: track.thumbnail || track.image || track.coverart }, caption: msg.trim() }, { quoted: m })
                        } else {
                            reply(msg.trim())
                        }
                    } catch { reply(msg.trim()) }
                    return
                }

                case 'pinterest':
                case 'pin': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/pinterest?q=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.images?.length) return reply('❌ No images found.')

                    await buildCarousel(xcasper, from, m, data.images.slice(0, 10), {
                        type: 'pinterest',
                        bodyText: `📌 *Pinterest Search*\n📝 Query: _${text}_`,
                        cardBuilder: (img, i) => ({
                            title: img.name || img.title || `Pin ${i + 1}`,
                            subtitle: img.description || '',
                            imageUrl: img.imageUrl || img.originalUrl || null,
                            buttons: [
                                ...(img.imageUrl || img.url ? [urlBtn('📌 View', img.imageUrl || img.url)] : []),
                                copyBtn(img.imageUrl || img.originalUrl)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'unsplash': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/unsplash?query=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.results?.length) return reply('❌ No photos found.')

                    await buildCarousel(xcasper, from, m, data.results.slice(0, 10), {
                        type: 'unsplash',
                        bodyText: `📸 *Unsplash Photos*\n📝 Query: _${text}_`,
                        cardBuilder: (img, i) => ({
                            title: img.description || `Photo ${i + 1}`,
                            subtitle: `👤 ${img.photographer || 'Unknown'}`,
                            imageUrl: img.thumbnail || null,
                            buttons: [
                                ...(img.url || img.thumbnail ? [urlBtn('📸 View HD', img.url || img.thumbnail)] : []),
                                copyBtn(img.url || img.thumbnail)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'wallpaper':
                case 'wallpapers':
                case 'hdwall': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/wallpapers?q=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.results?.length) return reply('❌ No wallpapers found.')

                    await buildCarousel(xcasper, from, m, data.results.slice(0, 10), {
                        type: 'wallpaper',
                        bodyText: `🖼️ *HD Wallpapers*\n📝 Query: _${text}_`,
                        cardBuilder: (w, i) => ({
                            title: w.title || `Wallpaper ${i + 1}`,
                            subtitle: w.resolution || '',
                            imageUrl: null,
                            buttons: [
                                ...(w.url || w.image ? [urlBtn('🖼️ Download', w.url || w.image)] : []),
                                copyBtn(w.url || w.image)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'weather':
                case 'cuaca': {
                    if (!text) return reply(`🌤️ Provide a city name.\n\nUsage: ${prefix}${command} <city>`)
                    const { data } = await axios.get(`${API}/weather?location=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success) return reply(`❌ ${data.message || 'Weather data not found.'}`)

                    let msg = `🌤️ *Weather in ${data.location}, ${data.country}*\n`
                    msg += `📍 ${data.region || ''}\n\n`
                    msg += `🌡️ Temperature: *${data.temperature?.celsius}°C* (${data.temperature?.fahrenheit}°F)\n`
                    msg += `🤔 Feels like: ${data.temperature?.feels_like_c}°C\n`
                    msg += `☁️ Condition: *${data.condition}*\n`
                    msg += `💧 Humidity: ${data.humidity}%\n`
                    msg += `💨 Wind: ${data.wind?.speed_kmph} km/h ${data.wind?.direction}\n`
                    msg += `👁️ Visibility: ${data.visibility_km} km\n`
                    msg += `☀️ UV Index: ${data.uv_index}\n\n`

                    if (data.forecast?.length) {
                        msg += `📅 *3-Day Forecast*\n`
                        for (const f of data.forecast) {
                            msg += `\n📆 ${f.date}\n`
                            msg += `  🌡️ ${f.min_c}°C - ${f.max_c}°C\n`
                            msg += `  ☁️ ${f.condition}\n`
                            msg += `  🌧️ Rain: ${f.chance_of_rain}%\n`
                        }
                    }

                    reply(msg.trim())
                    return
                }

                case 'playstore':
                case 'gplay': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/playstore?query=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.results?.length) return reply('❌ No apps found.')

                    await buildCarousel(xcasper, from, m, data.results.slice(0, 10), {
                        type: 'playstore',
                        bodyText: `📱 *Play Store Search*\n📝 Query: _${text}_`,
                        cardBuilder: (app, i) => ({
                            title: app.name || `App ${i + 1}`,
                            subtitle: `👤 ${app.developer || ''} | ⭐ ${app.rating || 'N/A'}`,
                            imageUrl: app.icon || null,
                            buttons: [
                                ...(app.url ? [urlBtn('📱 Install', app.url)] : []),
                                copyBtn(app.url)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'happymod': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/happymod?q=${encodeURIComponent(text)}`, { timeout: 20000 })
                    if (!data.success || !data.results?.length) return reply('❌ No modded apps found.')

                    await buildCarousel(xcasper, from, m, data.results.slice(0, 10), {
                        type: 'happymod',
                        bodyText: `🎮 *HappyMod Search*\n📝 Query: _${text}_`,
                        cardBuilder: (app, i) => ({
                            title: app.name || app.title || `Mod ${i + 1}`,
                            subtitle: `📦 ${app.version || ''} | 📏 ${app.size || ''} | ⭐ ${app.rating || 'N/A'}`,
                            imageUrl: null,
                            buttons: [
                                ...(app.url ? [urlBtn('⬇️ Download', app.url)] : []),
                                copyBtn(app.url)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'apkpure':
                case 'apk': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/apkpure?q=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.results?.length) return reply('❌ No APKs found.')

                    await buildCarousel(xcasper, from, m, data.results.slice(0, 10), {
                        type: 'apkpure',
                        bodyText: `📦 *APKPure Search*\n📝 Query: _${text}_`,
                        cardBuilder: (app, i) => ({
                            title: app.name || `APK ${i + 1}`,
                            subtitle: `👤 ${app.developer || ''} | 📦 v${app.version || '?'} | 📏 ${app.size || ''}`,
                            imageUrl: app.icon || null,
                            buttons: [
                                ...(app.download_url ? [urlBtn('⬇️ Download', app.download_url)] : (app.page_url ? [urlBtn('📦 View', app.page_url)] : [])),
                                copyBtn(app.download_url || app.page_url)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'stickersearch':
                case 'gifsearch': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/stickers?query=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.results?.length) return reply('❌ No stickers found.')

                    const stickers = data.results.slice(0, 5)
                    const stickerMeta = { packname: global.botname || 'CASPER-XD ULTRA', author: global.author || global.ownername || 'XyrooRynzz' }
                    for (const s of stickers) {
                        try {
                            const stickerUrl = s.url || s.thumbnail
                            if (!stickerUrl) continue
                            const mediaBuf = (await axios.get(stickerUrl, { responseType: 'arraybuffer', timeout: 15000 })).data
                            const isAnimated = stickerUrl.endsWith('.gif') || stickerUrl.includes('giphy') || stickerUrl.includes('.mp4')
                            let stickerPath
                            if (isAnimated) {
                                stickerPath = await writeExifVid(Buffer.from(mediaBuf), stickerMeta)
                            } else {
                                stickerPath = await writeExifImg(Buffer.from(mediaBuf), stickerMeta)
                            }
                            if (stickerPath) {
                                await xcasper.sendMessage(from, { sticker: fs.readFileSync(stickerPath) }, { quoted: m })
                                try { fs.unlinkSync(stickerPath) } catch {}
                            }
                        } catch {}
                    }
                    return
                }

                case 'tiktoksearch':
                case 'ttsearch': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/tiktok?query=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.results?.length) return reply('❌ No TikTok results found.')

                    await buildCarousel(xcasper, from, m, data.results.slice(0, 10), {
                        type: 'tiktok',
                        bodyText: `🎵 *TikTok Search*\n📝 Query: _${text}_`,
                        cardBuilder: (r, i) => ({
                            title: r.title || `TikTok ${i + 1}`,
                            subtitle: r.snippet || '',
                            imageUrl: null,
                            buttons: [
                                ...(r.url ? [urlBtn('🎵 Watch', r.url)] : []),
                                copyBtn(r.url)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                case 'wattpad': {
                    if (!text) return noQuery()
                    const { data } = await axios.get(`${API}/wattpad?q=${encodeURIComponent(text)}`, { timeout: 15000 })
                    if (!data.success || !data.stories?.length) return reply('❌ No stories found.')

                    await buildCarousel(xcasper, from, m, data.stories.slice(0, 10), {
                        type: 'wattpad',
                        bodyText: `📚 *Wattpad Search*\n📝 Query: _${text}_`,
                        cardBuilder: (s, i) => ({
                            title: s.title || `Story ${i + 1}`,
                            subtitle: (s.description || '').slice(0, 100),
                            imageUrl: s.cover || null,
                            buttons: [
                                ...(s.url ? [urlBtn('📚 Read', s.url)] : []),
                                copyBtn(s.url)
                            ].filter(Boolean)
                        })
                    })
                    return
                }

                default:
                    return reply(`❌ Unknown search command: ${command}`)
            }
        } catch (err) {
            console.log('Search plugin error:', err.message)
            const errMsg = err.response?.data?.message || err.message || 'An error occurred'
            reply(`❌ Error: ${errMsg}`)
        }
    }
}
