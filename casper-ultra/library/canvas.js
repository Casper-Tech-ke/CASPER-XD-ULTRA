const { createCanvas } = require('@napi-rs/canvas')

const SEARCH_THEMES = {
    spotify: { colors: ['#1DB954', '#0D4B22', '#191414'], icon: '🎵', accent: '#1ED760', label: 'Spotify' },
    youtube: { colors: ['#FF0000', '#8B0000', '#1A1A1A'], icon: '▶️', accent: '#FF4444', label: 'YouTube' },
    google: { colors: ['#4285F4', '#1A237E', '#0D1B2A'], icon: '🔍', accent: '#5C9EFF', label: 'Google' },
    duckduckgo: { colors: ['#DE5833', '#7B2D1A', '#1A1A2E'], icon: '🦆', accent: '#FF6F47', label: 'DuckDuckGo' },
    brave: { colors: ['#FB542B', '#8B2E15', '#1A1A2E'], icon: '🦁', accent: '#FF7A52', label: 'Brave' },
    applemusic: { colors: ['#FC3C44', '#8B1A2E', '#1A0A10'], icon: '🍎', accent: '#FF5E6E', label: 'Apple Music' },
    soundcloud: { colors: ['#FF5500', '#8B2D00', '#1A1208'], icon: '🔊', accent: '#FF7733', label: 'SoundCloud' },
    pinterest: { colors: ['#E60023', '#7B0013', '#1A0A0E'], icon: '📌', accent: '#FF2244', label: 'Pinterest' },
    playstore: { colors: ['#00C853', '#006B2D', '#0A1A10'], icon: '📱', accent: '#33FF77', label: 'Play Store' },
    happymod: { colors: ['#2196F3', '#0D47A1', '#0A1020'], icon: '🎮', accent: '#64B5F6', label: 'HappyMod' },
    apkpure: { colors: ['#A4C639', '#5A6E1E', '#0A1A08'], icon: '📦', accent: '#C6E84A', label: 'APKPure' },
    tiktok: { colors: ['#FF0050', '#00F2EA', '#1A1A2E'], icon: '🎵', accent: '#FF3377', label: 'TikTok' },
    unsplash: { colors: ['#111111', '#333333', '#000000'], icon: '📸', accent: '#FFFFFF', label: 'Unsplash' },
    wallpaper: { colors: ['#9C27B0', '#4A148C', '#12001A'], icon: '🖼️', accent: '#CE93D8', label: 'Wallpaper' },
    wattpad: { colors: ['#FF6122', '#8B3410', '#1A0F08'], icon: '📚', accent: '#FF8A50', label: 'Wattpad' },
    weather: { colors: ['#03A9F4', '#01579B', '#0A1A2E'], icon: '🌤️', accent: '#4FC3F7', label: 'Weather' },
    sticker: { colors: ['#E040FB', '#7B1FA2', '#1A0A20'], icon: '🎨', accent: '#EA80FC', label: 'Stickers' },
    lyrics: { colors: ['#FF4081', '#880E4F', '#1A0A15'], icon: '🎤', accent: '#FF80AB', label: 'Lyrics' },
    shazam: { colors: ['#0088FF', '#003D73', '#0A1020'], icon: '🎵', accent: '#40A9FF', label: 'Shazam' },
    web: { colors: ['#4285F4', '#1565C0', '#0D1B2A'], icon: '🌐', accent: '#64B5F6', label: 'Web Search' },
    image: { colors: ['#FF6F00', '#E65100', '#1A1208'], icon: '🖼️', accent: '#FFA726', label: 'Images' }
}

function createSearchCard(title, subtitle, options = {}) {
    const { width = 384, height = 216, type = 'web', index = 0 } = options
    const theme = SEARCH_THEMES[type] || SEARCH_THEMES.web

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    const bgGrad = ctx.createLinearGradient(0, 0, width, height)
    bgGrad.addColorStop(0, theme.colors[0])
    bgGrad.addColorStop(0.5, theme.colors[1])
    bgGrad.addColorStop(1, theme.colors[2])
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, width, height)

    ctx.globalAlpha = 0.08
    for (let i = 0; i < 6; i++) {
        const x = width * (0.5 + Math.sin(i * 1.5) * 0.4)
        const y = height * (0.4 + Math.cos(i * 0.9) * 0.35)
        const r = 40 + i * 30
        const orbGrad = ctx.createRadialGradient(x, y, 0, x, y, r)
        orbGrad.addColorStop(0, theme.accent)
        orbGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = orbGrad
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
    }
    ctx.globalAlpha = 1.0

    ctx.strokeStyle = `${theme.accent}12`
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.moveTo(0, height * 0.25 + i * 18)
        ctx.bezierCurveTo(width * 0.3, height * 0.15 + i * 14, width * 0.7, height * 0.45 + i * 10, width, height * 0.25 + i * 22)
        ctx.stroke()
    }

    const accentGrad = ctx.createLinearGradient(0, 0, width * 0.5, 0)
    accentGrad.addColorStop(0, theme.accent)
    accentGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = accentGrad
    ctx.fillRect(0, 0, width * 0.5, 3)

    ctx.fillStyle = `${theme.accent}30`
    ctx.beginPath()
    ctx.roundRect(15, 14, 48, 32, 8)
    ctx.fill()
    ctx.font = '22px sans-serif'
    ctx.fillStyle = theme.accent
    ctx.fillText(theme.icon, 21, 38)

    ctx.font = 'bold 13px sans-serif'
    ctx.fillStyle = theme.accent
    ctx.fillText(theme.label.toUpperCase(), 72, 34)

    ctx.fillStyle = `${theme.accent}50`
    ctx.font = 'bold 13px sans-serif'
    const numText = `#${index + 1}`
    const numWidth = ctx.measureText(numText).width
    ctx.beginPath()
    ctx.roundRect(width - numWidth - 24, 14, numWidth + 16, 28, 8)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(numText, width - numWidth - 16, 33)

    ctx.fillStyle = theme.accent
    ctx.fillRect(15, 58, 35, 3)
    ctx.fillStyle = `${theme.accent}40`
    ctx.fillRect(56, 59, 70, 1)

    ctx.font = 'bold 20px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    const words = (title || '').split(' ')
    let line = ''
    let y = 90
    const maxWidth = width - 35
    const maxLines = 4
    let lineCount = 0
    for (const word of words) {
        const test = line + word + ' '
        if (ctx.measureText(test).width > maxWidth && line) {
            ctx.fillText(line.trim(), 15, y)
            line = word + ' '
            y += 28
            lineCount++
            if (lineCount >= maxLines) break
        } else {
            line = test
        }
    }
    if (lineCount < maxLines && line.trim()) ctx.fillText(line.trim(), 15, y)

    const brandGrad = ctx.createLinearGradient(0, height - 32, width, height)
    brandGrad.addColorStop(0, `${theme.colors[2]}DD`)
    brandGrad.addColorStop(1, `${theme.colors[1]}DD`)
    ctx.fillStyle = brandGrad
    ctx.fillRect(0, height - 32, width, 32)

    ctx.fillStyle = `${theme.accent}60`
    ctx.fillRect(0, height - 32, width, 1)

    ctx.font = 'bold 11px sans-serif'
    ctx.fillStyle = `${theme.accent}BB`
    ctx.fillText(`${theme.icon}  CASPER-XD ULTRA`, 15, height - 11)

    return canvas.toBuffer('image/png')
}

function createSportsCard(title, options = {}) {
    const { width = 384, height = 216, type = 'news' } = options

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createLinearGradient(0, 0, width, height)
    if (type === 'video') {
        gradient.addColorStop(0, '#1a1a2e')
        gradient.addColorStop(1, '#16213e')
    } else if (type === 'live-blog') {
        gradient.addColorStop(0, '#0f3460')
        gradient.addColorStop(1, '#16213e')
    } else {
        gradient.addColorStop(0, '#0d1b2a')
        gradient.addColorStop(1, '#1b263b')
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i < 6; i++) {
        ctx.beginPath()
        ctx.arc(width * 0.7, height * 0.5, 30 + i * 20, 0, Math.PI * 2)
        ctx.stroke()
    }

    const icon = type === 'video' ? '🎥' : type === 'live-blog' ? '📡' : '📰'
    ctx.font = '32px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText(icon, 20, 50)

    ctx.fillStyle = '#e94560'
    ctx.fillRect(20, 70, 40, 4)

    ctx.font = 'bold 18px sans-serif'
    ctx.fillStyle = '#ffffff'
    const words = title.split(' ')
    let line = ''
    let y = 100
    const maxWidth = width - 40
    for (const word of words) {
        const test = line + word + ' '
        const metrics = ctx.measureText(test)
        if (metrics.width > maxWidth && line) {
            ctx.fillText(line.trim(), 20, y)
            line = word + ' '
            y += 26
            if (y > height - 30) break
        } else {
            line = test
        }
    }
    if (y <= height - 30) {
        ctx.fillText(line.trim(), 20, y)
    }

    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '12px sans-serif'
    ctx.fillText('⚽ CASPER-XD ULTRA', 20, height - 15)

    return canvas.toBuffer('image/png')
}

module.exports = { createSportsCard, createSearchCard }
