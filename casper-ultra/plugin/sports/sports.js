const axios = require('axios')
const { generateWAMessageContent, generateWAMessageFromContent } = require('baileys')
const { sendButtons, sendCarousel } = require('../../library/sendButtons')
const { createSportsCard } = require('../../library/canvas')

const API_BASE = 'https://apis.xcasper.space/api/sports'
const SPORTS_IMG = 'https://files.catbox.moe/2dltxo.jpg'

const TEAM_ALIASES = {
    'man city': 'manchester-city', 'mancity': 'manchester-city', 'mcfc': 'manchester-city', 'city': 'manchester-city',
    'man u': 'manchester-united', 'manu': 'manchester-united', 'man utd': 'manchester-united', 'manutd': 'manchester-united', 'mufc': 'manchester-united', 'united': 'manchester-united',
    'brighton': 'brighton-and-hove-albion', 'briton': 'brighton-and-hove-albion', 'bhafc': 'brighton-and-hove-albion',
    'spurs': 'tottenham-hotspur', 'tottenham': 'tottenham-hotspur', 'thfc': 'tottenham-hotspur',
    'wolves': 'wolverhampton-wanderers', 'wolverhampton': 'wolverhampton-wanderers',
    'west ham': 'west-ham-united', 'westham': 'west-ham-united', 'whufc': 'west-ham-united', 'hammers': 'west-ham-united',
    'palace': 'crystal-palace', 'cpfc': 'crystal-palace',
    'villa': 'aston-villa', 'avfc': 'aston-villa',
    'forest': 'nottingham-forest', 'nffc': 'nottingham-forest', 'nottingham': 'nottingham-forest',
    'newcastle': 'newcastle-united', 'nufc': 'newcastle-united', 'toon': 'newcastle-united',
    'leicester': 'leicester-city', 'lcfc': 'leicester-city',
    'ipswich': 'ipswich-town', 'itfc': 'ipswich-town',
    'leeds': 'leeds-united', 'lufc': 'leeds-united',
    'gunners': 'arsenal', 'afc': 'arsenal',
    'blues': 'chelsea', 'cfc': 'chelsea',
    'reds': 'liverpool', 'lfc': 'liverpool', 'pool': 'liverpool',
    'toffees': 'everton', 'efc': 'everton',
    'cherries': 'bournemouth', 'afcb': 'bournemouth',
    'bees': 'brentford',
    'cottagers': 'fulham', 'ffc': 'fulham',
    'cats': 'sunderland', 'safc': 'sunderland',
    'barca': 'barcelona', 'fcb': 'barcelona',
    'madrid': 'real-madrid', 'rmcf': 'real-madrid',
    'bayern': 'bayern-munich', 'fcbayern': 'bayern-munich',
    'psg': 'paris-saint-germain',
    'juve': 'juventus',
    'milan': 'ac-milan',
    'inter': 'inter-milan', 'internazionale': 'inter-milan',
    'dortmund': 'borussia-dortmund', 'bvb': 'borussia-dortmund',
}

function toSlug(name) {
    const input = (name || '').toLowerCase().trim()
    if (TEAM_ALIASES[input]) return TEAM_ALIASES[input]
    return input
        .replace(/&/g, 'and')
        .replace(/['']/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

const LEAGUE_ALIASES = {
    'epl': 'eng.1', 'premier': 'eng.1', 'premierleague': 'eng.1', 'pl': 'eng.1',
    'laliga': 'esp.1', 'liga': 'esp.1', 'spain': 'esp.1',
    'bundesliga': 'ger.1', 'buli': 'ger.1', 'germany': 'ger.1',
    'seriea': 'ita.1', 'italy': 'ita.1',
    'ligue1': 'fra.1', 'france': 'fra.1',
    'eredivisie': 'ned.1', 'dutch': 'ned.1',
    'primeira': 'por.1', 'portugal': 'por.1',
    'superlig': 'tur.1', 'turkey': 'tur.1',
    'mls': 'usa.1', 'usa': 'usa.1',
    'ligamx': 'mex.1', 'mexico': 'mex.1',
    'brazil': 'bra.1', 'brasileirao': 'bra.1',
    'argentina': 'arg.1',
    'ucl': 'uefa.champions', 'championsleague': 'uefa.champions', 'cl': 'uefa.champions',
    'uel': 'uefa.europa', 'europaleague': 'uefa.europa', 'el': 'uefa.europa',
    'uecl': 'uefa.europa.conf', 'conferenceleague': 'uefa.europa.conf',
    'championship': 'eng.2', 'efl': 'eng.2',
    'scotland': 'sco.1',
    'belgium': 'bel.1',
    'australia': 'aus.1', 'aleague': 'aus.1',
    'greece': 'gre.1',
    'russia': 'rus.1'
}

const SLUG_TO_FIXTURE = {
    'eng.1': 'premier-league', 'esp.1': 'la-liga', 'ger.1': 'bundesliga',
    'ita.1': 'serie-a', 'fra.1': 'ligue-1', 'eng.2': 'championship',
    'uefa.champions': 'champions-league', 'uefa.europa': 'europa-league'
}

const LEAGUE_NAMES = {
    'eng.1': 'Premier League', 'esp.1': 'La Liga', 'ger.1': 'Bundesliga',
    'ita.1': 'Serie A', 'fra.1': 'Ligue 1', 'ned.1': 'Eredivisie',
    'por.1': 'Primeira Liga', 'tur.1': 'Super Lig', 'usa.1': 'MLS',
    'mex.1': 'Liga MX', 'bra.1': 'Serie A Brazil', 'arg.1': 'Primera Division',
    'uefa.champions': 'Champions League', 'uefa.europa': 'Europa League',
    'uefa.europa.conf': 'Conference League', 'eng.2': 'Championship',
    'sco.1': 'Scottish Premiership', 'bel.1': 'Pro League'
}

function resolveLeague(input) {
    if (!input) return null
    const clean = input.toLowerCase().replace(/[\s\-_\.]/g, '')
    if (LEAGUE_ALIASES[clean]) return LEAGUE_ALIASES[clean]
    if (input.includes('.')) return input.toLowerCase()
    return null
}

function statusEmoji(status) {
    if (status.isLive) return '🔴'
    if (status.isResult) return '✅'
    if (status.isFixture) return '📅'
    if (status.state === 'cancelled') return '🚫'
    return '⏳'
}

function formatScore(match) {
    const { homeTeam, awayTeam, score, status, startTime } = match
    const emoji = statusEmoji(status)
    const scoreText = status.isLive || status.isResult
        ? `${score.home} - ${score.away}`
        : `${startTime || 'TBD'}`
    const ht = score.halftime ? ` (HT: ${score.halftime.home}-${score.halftime.away})` : ''
    return `${emoji} ${homeTeam} ${scoreText} ${awayTeam}${ht}`
}

function btn(displayText, id) {
    return { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: displayText, id }) }
}

function urlBtn(displayText, url) {
    return { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: displayText, url }) }
}

function copyBtn(displayText, copyCode) {
    return { name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: displayText, copy_code: copyCode }) }
}

function listBtn(title, sections) {
    return { name: 'single_select', buttonParamsJson: JSON.stringify({ title, sections }) }
}

const FOOTER = '⚽ CASPER-XD ULTRA Sports'

module.exports = {
    type: 'sports',
    command: ['scores', 'livescores', 'livescore', 'fixtures', 'standings', 'table', 'league', 'topscorers', 'topscorer', 'goldenboot', 'teamform', 'form', 'matchstats', 'analyze', 'predict', 'analysis', 'sportnews', 'footballnews', 'teamnews'],
    operate: async (context) => {
        const { command, text, args, reply, m, xcasper, prefix, from } = context

        try {
            switch (command) {

                case 'scores':
                case 'livescores':
                case 'livescore': {
                    const competition = text || null
                    let url = `${API_BASE}?action=matches`
                    if (competition) url += `&competition=${encodeURIComponent(competition)}`

                    const { data } = await axios.get(url, { timeout: 15000 })
                    if (!data.success) return reply(`❌ ${data.message || 'Failed to fetch scores'}`)

                    const matches = data.matches || []
                    if (!matches.length) return reply('⚽ No matches found.')

                    const live = matches.filter(mt => mt.status.isLive)
                    const results = matches.filter(mt => mt.status.isResult)
                    const upcoming = matches.filter(mt => mt.status.isFixture)

                    const headerBadge = (live[0] || results[0] || upcoming[0])?.homeBadge || ''

                    let msg = `⚽ *Football Scores*\n`
                    if (competition) msg += `🏟️ ${competition}\n`
                    msg += `📊 ${matches.length} matches | 🔴 ${live.length} live | ✅ ${results.length} results | 📅 ${upcoming.length} upcoming\n`

                    if (live.length) {
                        msg += `\n*🔴 LIVE*\n`
                        for (const mt of live.slice(0, 15)) {
                            msg += `${formatScore(mt)}\n  _${mt.competition.short || mt.competition.name}_ | ID: ${mt.id}\n`
                        }
                    }

                    if (results.length) {
                        msg += `\n*✅ Results*\n`
                        for (const mt of results.slice(0, 20)) {
                            msg += `${formatScore(mt)}\n  _${mt.competition.short || mt.competition.name}_ | ID: ${mt.id}\n`
                        }
                    }

                    if (upcoming.length) {
                        msg += `\n*📅 Upcoming*\n`
                        for (const mt of upcoming.slice(0, 15)) {
                            msg += `${formatScore(mt)}\n  _${mt.competition.short || mt.competition.name}_\n`
                        }
                    }

                    try {
                        await sendButtons(xcasper, from, {
                            text: msg.trim(),
                            footer: FOOTER,
                            image: headerBadge,
                            buttons: [
                                btn('📅 Fixtures', `${prefix}fixtures`),
                                btn('🔄 Refresh', `${prefix}scores${competition ? ' ' + competition : ''}`),
                                listBtn('🏟️ Filter by League', [{
                                    title: '⚽ Popular Leagues',
                                    rows: [
                                        { title: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League', id: `${prefix}scores Premier League` },
                                        { title: '🇪🇸 La Liga', id: `${prefix}scores La Liga` },
                                        { title: '🇩🇪 Bundesliga', id: `${prefix}scores Bundesliga` },
                                        { title: '🇮🇹 Serie A', id: `${prefix}scores Serie A` },
                                        { title: '🇫🇷 Ligue 1', id: `${prefix}scores Ligue 1` },
                                        { title: '🏆 Champions League', id: `${prefix}scores Champions League` }
                                    ]
                                }])
                            ]
                        }, { quoted: m })
                    } catch (e) {
                        return reply(msg.trim())
                    }
                    return
                }

                case 'fixtures': {
                    const leagueInput = text || null
                    let url = `${API_BASE}?action=fixtures`
                    if (leagueInput) {
                        const slug = resolveLeague(leagueInput)
                        const fixLeague = slug ? (SLUG_TO_FIXTURE[slug] || slug) : leagueInput
                        url += `&league=${encodeURIComponent(fixLeague)}`
                    }

                    const { data } = await axios.get(url, { timeout: 15000 })
                    if (!data.success) return reply(`❌ ${data.message || 'Failed to fetch fixtures'}`)

                    const matches = data.matches || []
                    if (!matches.length) return reply('📅 No fixtures found.')

                    const live = matches.filter(mt => mt.status.isLive)
                    const upcoming = matches.filter(mt => mt.status.isFixture)
                    const results = matches.filter(mt => mt.status.isResult)

                    const fixBadge = (live[0] || upcoming[0] || results[0])?.homeBadge || ''

                    let msg = `📅 *Football Fixtures*\n`
                    msg += `📊 ${matches.length} matches`
                    if (data.metadata?.leagues) msg += ` across ${data.metadata.leagues.length} leagues`
                    msg += `\n`

                    if (live.length) {
                        msg += `\n*🔴 LIVE NOW*\n`
                        for (const mt of live.slice(0, 10)) {
                            msg += `${formatScore(mt)}\n  _${mt.competition.name}_ ${mt.channel ? `| 📺 ${mt.channel}` : ''}\n`
                        }
                    }

                    if (upcoming.length) {
                        msg += `\n*📅 Upcoming*\n`
                        const byDate = {}
                        for (const mt of upcoming.slice(0, 30)) {
                            const d = mt.startDate || 'TBD'
                            if (!byDate[d]) byDate[d] = []
                            byDate[d].push(mt)
                        }
                        for (const [date, games] of Object.entries(byDate)) {
                            msg += `\n📆 _${date}_\n`
                            for (const mt of games) {
                                msg += `${formatScore(mt)}\n  _${mt.competition.name}_ ${mt.channel ? `| 📺 ${mt.channel}` : ''}\n`
                            }
                        }
                    }

                    if (results.length) {
                        msg += `\n*✅ Recent Results*\n`
                        for (const mt of results.slice(0, 15)) {
                            msg += `${formatScore(mt)}\n  _${mt.competition.name}_\n`
                        }
                    }

                    try {
                        await sendButtons(xcasper, from, {
                            text: msg.trim(),
                            footer: FOOTER,
                            image: fixBadge,
                            buttons: [
                                btn('⚽ Live Scores', `${prefix}scores`),
                                btn('🔄 Refresh', `${prefix}fixtures${leagueInput ? ' ' + leagueInput : ''}`),
                                listBtn('🏟️ Filter League', [{
                                    title: '⚽ Select League',
                                    rows: [
                                        { title: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League', id: `${prefix}fixtures epl` },
                                        { title: '🇪🇸 La Liga', id: `${prefix}fixtures laliga` },
                                        { title: '🇩🇪 Bundesliga', id: `${prefix}fixtures bundesliga` },
                                        { title: '🇮🇹 Serie A', id: `${prefix}fixtures seriea` },
                                        { title: '🇫🇷 Ligue 1', id: `${prefix}fixtures ligue1` },
                                        { title: '🏆 Champions League', id: `${prefix}fixtures ucl` },
                                        { title: '🏆 Europa League', id: `${prefix}fixtures uel` },
                                        { title: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Championship', id: `${prefix}fixtures championship` }
                                    ]
                                }])
                            ]
                        }, { quoted: m })
                    } catch (e) {
                        return reply(msg.trim())
                    }
                    return
                }

                case 'standings':
                case 'table':
                case 'league': {
                    if (!text) {
                        try {
                            await sendButtons(xcasper, from, {
                                text: '⚽ *League Standings*\nSelect a league to view the table.',
                                footer: FOOTER,
                                buttons: [
                                    listBtn('🏟️ Select League', [{
                                        title: '⚽ Leagues',
                                        rows: [
                                            { title: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League', id: `${prefix}standings epl` },
                                            { title: '🇪🇸 La Liga', id: `${prefix}standings laliga` },
                                            { title: '🇩🇪 Bundesliga', id: `${prefix}standings bundesliga` },
                                            { title: '🇮🇹 Serie A', id: `${prefix}standings seriea` },
                                            { title: '🇫🇷 Ligue 1', id: `${prefix}standings ligue1` },
                                            { title: '🇳🇱 Eredivisie', id: `${prefix}standings eredivisie` },
                                            { title: '🇵🇹 Primeira Liga', id: `${prefix}standings primeira` },
                                            { title: '🇺🇸 MLS', id: `${prefix}standings mls` },
                                            { title: '🇧🇷 Serie A Brazil', id: `${prefix}standings brazil` },
                                            { title: '🇦🇷 Primera Division', id: `${prefix}standings argentina` }
                                        ]
                                    }])
                                ]
                            }, { quoted: m })
                        } catch (e) {
                            return reply('⚽ Provide a league.\n\nUsage: .standings <league>\nExample: .standings epl\n\nAliases: epl, laliga, bundesliga, seriea, ligue1, ucl, mls')
                        }
                        return
                    }

                    const slug = resolveLeague(text) || text.toLowerCase()
                    const leagueName = LEAGUE_NAMES[slug] || slug.toUpperCase()
                    const { data } = await axios.get(`${API_BASE}?action=standings&slug=${encodeURIComponent(slug)}`, { timeout: 15000 })
                    if (!data.success) return reply(`❌ ${data.message || 'Failed to fetch standings'}`)

                    const standings = data.standings || []
                    if (!standings.length) return reply('❌ No standings data found for that league.')

                    let msg = `🏆 *${leagueName} Standings*\n`
                    msg += `📊 ${data.totalTeams || standings.length} teams\n\n`

                    for (const t of standings) {
                        const rank = String(t.rank).padEnd(2)
                        const team = (t.team || '').slice(0, 16)
                        const pts = t.points
                        const gd = (t.goalDifference >= 0 ? '+' : '') + t.goalDifference
                        const pos = t.rank <= 4 ? '🟢' : t.rank >= (standings.length - 2) ? '🔴' : '⚪'
                        msg += `${pos} *${rank}* ${team} | ${t.played}P ${t.won}W ${t.drawn}D ${t.lost}L | GD:${gd} | *${pts}pts*\n`
                    }

                    try {
                        await sendButtons(xcasper, from, {
                            text: msg.trim(),
                            footer: FOOTER,
                            buttons: [
                                btn('🥇 Top Scorers', `${prefix}topscorers ${text}`),
                                btn('🔄 Refresh', `${prefix}standings ${text}`),
                                listBtn('📊 Team Form', [{
                                    title: '⚽ Select Team',
                                    rows: standings.slice(0, 10).map(t => ({
                                        title: `${t.rank}. ${(t.team || '').slice(0, 20)}`,
                                        description: `${t.points}pts | ${t.won}W ${t.drawn}D ${t.lost}L`,
                                        id: `${prefix}teamform ${t.team} ${text}`
                                    }))
                                }])
                            ]
                        }, { quoted: m })
                    } catch (e) {
                        return reply(msg.trim())
                    }
                    return
                }

                case 'topscorers':
                case 'topscorer':
                case 'goldenboot': {
                    if (!text) {
                        try {
                            await sendButtons(xcasper, from, {
                                text: '🥇 *Top Scorers*\nSelect a league to view top goal scorers.',
                                footer: FOOTER,
                                buttons: [
                                    listBtn('🏟️ Select League', [{
                                        title: '⚽ Leagues',
                                        rows: [
                                            { title: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League', id: `${prefix}topscorers epl` },
                                            { title: '🇪🇸 La Liga', id: `${prefix}topscorers laliga` },
                                            { title: '🇩🇪 Bundesliga', id: `${prefix}topscorers bundesliga` },
                                            { title: '🇮🇹 Serie A', id: `${prefix}topscorers seriea` },
                                            { title: '🇫🇷 Ligue 1', id: `${prefix}topscorers ligue1` },
                                            { title: '🇳🇱 Eredivisie', id: `${prefix}topscorers eredivisie` }
                                        ]
                                    }])
                                ]
                            }, { quoted: m })
                        } catch (e) {
                            return reply('⚽ Provide a league.\n\nUsage: .topscorers <league>\nExample: .topscorers epl')
                        }
                        return
                    }

                    const slug = resolveLeague(text) || text.toLowerCase()
                    const leagueName = LEAGUE_NAMES[slug] || slug.toUpperCase()
                    const { data } = await axios.get(`${API_BASE}?action=topscorers&slug=${encodeURIComponent(slug)}`, { timeout: 15000 })
                    if (!data.success) return reply(`❌ ${data.message || 'Failed to fetch top scorers'}`)

                    const scorers = data.topScorers || []
                    if (!scorers.length) return reply('❌ No top scorer data found.')

                    let msg = `🥇 *${leagueName} Top Scorers*\n\n`

                    for (const s of scorers) {
                        const medal = s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : `${s.rank}.`
                        const assists = s.assists ? ` (${s.assists} assists)` : ''
                        msg += `${medal} *${s.player}* — ${s.goals} goals${assists}\n   _${s.team}_\n`
                    }

                    try {
                        await sendButtons(xcasper, from, {
                            text: msg.trim(),
                            footer: FOOTER,
                            buttons: [
                                btn('🏆 Standings', `${prefix}standings ${text}`),
                                btn('🔄 Refresh', `${prefix}topscorers ${text}`)
                            ]
                        }, { quoted: m })
                    } catch (e) {
                        return reply(msg.trim())
                    }
                    return
                }

                case 'teamform':
                case 'form': {
                    if (!text) return reply(`⚽ Provide team and league.\n\nUsage: .teamform <team> <league>\nExample: .teamform Arsenal epl`)

                    const parts = text.split(/\s+/)
                    if (parts.length < 2) return reply('⚽ Usage: .teamform <team> <league>\nExample: .teamform Arsenal epl')

                    const leagueArg = parts[parts.length - 1]
                    const teamName = parts.slice(0, -1).join(' ')
                    const slug = resolveLeague(leagueArg) || leagueArg.toLowerCase()

                    const { data } = await axios.get(`${API_BASE}?action=teamform&team=${encodeURIComponent(teamName)}&slug=${encodeURIComponent(slug)}`, { timeout: 15000 })
                    if (!data.success) return reply(`❌ ${data.message || 'Failed to fetch team form'}`)

                    let msg = `📊 *${data.team || teamName} Form*\n`

                    if (data.standing) {
                        const s = data.standing
                        msg += `\n🏆 *League Position*\n`
                        msg += `#${s.rank} | P:${s.played} W:${s.won} D:${s.drawn} L:${s.lost}\n`
                        msg += `GF:${s.goalsFor} GA:${s.goalsAgainst} GD:${s.goalDifference >= 0 ? '+' : ''}${s.goalDifference}\n`
                        msg += `Points: *${s.points}*\n`
                    }

                    const formResults = data.results || []
                    if (formResults.length) {
                        msg += `\n📋 *Recent Results* (${formResults.length} games)\n`
                        const formIcons = formResults.slice(0, 10).map(r =>
                            r.result === 'W' ? '🟢' : r.result === 'D' ? '🟡' : r.result === 'L' ? '🔴' : '⚪'
                        ).join('')
                        msg += `Form: ${formIcons}\n\n`

                        for (const r of formResults.slice(0, 8)) {
                            const icon = r.result === 'W' ? '🟢' : r.result === 'D' ? '🟡' : r.result === 'L' ? '🔴' : '⚪'
                            msg += `${icon} ${r.homeTeam} ${r.homeScore}-${r.awayScore} ${r.awayTeam}\n   _${r.date}_\n`
                        }
                    }

                    try {
                        await sendButtons(xcasper, from, {
                            text: msg.trim(),
                            footer: FOOTER,
                            buttons: [
                                btn('🏆 Standings', `${prefix}standings ${leagueArg}`),
                                btn('📰 Team News', `${prefix}teamnews ${toSlug(teamName)}`),
                                btn('🔄 Refresh', `${prefix}teamform ${text}`)
                            ]
                        }, { quoted: m })
                    } catch (e) {
                        return reply(msg.trim())
                    }
                    return
                }

                case 'matchstats': {
                    if (!text) return reply(`⚽ Provide a match ID.\n\nUsage: .matchstats <matchId>\nGet match IDs from .scores or .fixtures`)

                    const matchId = text.trim()
                    const { data } = await axios.get(`${API_BASE}?action=matchstats&matchId=${encodeURIComponent(matchId)}`, { timeout: 15000 })
                    if (!data.success) return reply(`❌ ${data.message || 'Failed to fetch match stats'}`)

                    const matchBadge = data.match?.homeBadge || ''

                    let msg = `📊 *Match Stats*\n`

                    if (data.match) {
                        const mt = data.match
                        msg += `\n${mt.homeTeam || 'Home'} vs ${mt.awayTeam || 'Away'}\n`
                        if (mt.score) msg += `Score: ${mt.score.home} - ${mt.score.away}\n`
                    }

                    if (data.stats && typeof data.stats === 'object') {
                        msg += `\n📈 *Statistics*\n`
                        for (const [key, val] of Object.entries(data.stats)) {
                            if (Array.isArray(val)) {
                                msg += `\n*${key}*\n`
                                for (const item of val) {
                                    if (typeof item === 'object') {
                                        msg += `  ${item.name || item.label || ''}: ${item.home || ''} - ${item.away || ''}\n`
                                    } else {
                                        msg += `  ${item}\n`
                                    }
                                }
                            } else if (typeof val === 'object' && val !== null) {
                                msg += `${key}: ${JSON.stringify(val)}\n`
                            } else {
                                msg += `${key}: ${val}\n`
                            }
                        }
                    }

                    if (data.events && Array.isArray(data.events)) {
                        msg += `\n⚡ *Events*\n`
                        for (const e of data.events.slice(0, 15)) {
                            msg += `${e.minute || ''}' ${e.type || ''} - ${e.player || e.team || ''}\n`
                        }
                    }

                    const buttons = [
                        btn('⚽ Live Scores', `${prefix}scores`),
                        btn('🔄 Refresh', `${prefix}matchstats ${matchId}`)
                    ]

                    if (data.match?.homeTeam && data.match?.awayTeam) {
                        buttons.push(btn('🔮 Analyze', `${prefix}analyze ${data.match.homeTeam} vs ${data.match.awayTeam}`))
                    }

                    try {
                        await sendButtons(xcasper, from, {
                            text: msg.trim(),
                            footer: FOOTER,
                            image: matchBadge,
                            buttons
                        }, { quoted: m })
                    } catch (e) {
                        return reply(msg.trim())
                    }
                    return
                }

                case 'analyze':
                case 'predict':
                case 'analysis': {
                    if (!text) return reply(`⚽ Provide two teams.\n\nUsage: .analyze <home> vs <away>\nExample: .analyze Arsenal vs Chelsea`)

                    let parts
                    if (text.toLowerCase().includes(' vs ')) {
                        parts = text.split(/\s+vs\s+/i)
                    } else if (text.toLowerCase().includes(' v ')) {
                        parts = text.split(/\s+v\s+/i)
                    } else {
                        parts = text.split(/\s+against\s+/i)
                    }

                    if (!parts || parts.length < 2) return reply('⚽ Usage: .analyze <home> vs <away>\nExample: .analyze Arsenal vs Chelsea')

                    const homeTeam = parts[0].trim()
                    const awayTeam = parts[1].trim()

                    await reply(`🔍 Analyzing *${homeTeam}* vs *${awayTeam}*...`)

                    const { data } = await axios.get(`${API_BASE}?action=analyze&homeTeam=${encodeURIComponent(homeTeam)}&awayTeam=${encodeURIComponent(awayTeam)}`, { timeout: 30000 })
                    if (!data.success) return reply(`❌ ${data.message || 'Failed to analyze match'}`)

                    let msg = `🔮 *Match Analysis*\n`
                    msg += `⚽ ${homeTeam} vs ${awayTeam}\n`

                    if (data.standings && data.standings.length) {
                        const home = data.standings.find(t => t.team.toLowerCase().includes(homeTeam.toLowerCase()))
                        const away = data.standings.find(t => t.team.toLowerCase().includes(awayTeam.toLowerCase()))
                        if (home && away) {
                            msg += `\n📊 *League Positions*\n`
                            msg += `${home.team}: #${home.rank} (${home.points}pts, GD:${home.goalDifference >= 0 ? '+' : ''}${home.goalDifference})\n`
                            msg += `${away.team}: #${away.rank} (${away.points}pts, GD:${away.goalDifference >= 0 ? '+' : ''}${away.goalDifference})\n`
                        }
                    }

                    if (data.homeForm && data.homeForm.length) {
                        const form = data.homeForm.slice(0, 5).map(r =>
                            r.result === 'W' ? '🟢' : r.result === 'D' ? '🟡' : r.result === 'L' ? '🔴' : '⚪'
                        ).join('')
                        msg += `\n📋 *${homeTeam} Form:* ${form}\n`
                        for (const r of data.homeForm.slice(0, 5)) {
                            msg += `  ${r.result === 'W' ? '🟢' : r.result === 'D' ? '🟡' : '🔴'} ${r.homeTeam} ${r.homeScore}-${r.awayScore} ${r.awayTeam}\n`
                        }
                    }

                    if (data.awayForm && data.awayForm.length) {
                        const form = data.awayForm.slice(0, 5).map(r =>
                            r.result === 'W' ? '🟢' : r.result === 'D' ? '🟡' : r.result === 'L' ? '🔴' : '⚪'
                        ).join('')
                        msg += `\n📋 *${awayTeam} Form:* ${form}\n`
                        for (const r of data.awayForm.slice(0, 5)) {
                            msg += `  ${r.result === 'W' ? '🟢' : r.result === 'D' ? '🟡' : '🔴'} ${r.homeTeam} ${r.homeScore}-${r.awayScore} ${r.awayTeam}\n`
                        }
                    }

                    if (data.topScorers && data.topScorers.length) {
                        const homeScorers = data.topScorers.filter(s => s.team.toLowerCase().includes(homeTeam.toLowerCase()))
                        const awayScorers = data.topScorers.filter(s => s.team.toLowerCase().includes(awayTeam.toLowerCase()))
                        if (homeScorers.length || awayScorers.length) {
                            msg += `\n🥇 *Key Scorers*\n`
                            for (const s of [...homeScorers, ...awayScorers].slice(0, 6)) {
                                msg += `  ⚽ ${s.player} (${s.team}) - ${s.goals} goals\n`
                            }
                        }
                    }

                    if (data.aiAnalysis) {
                        msg += `\n🤖 *AI Analysis*\n${data.aiAnalysis}\n`
                    }

                    try {
                        await sendButtons(xcasper, from, {
                            text: msg.trim(),
                            footer: FOOTER,
                            buttons: [
                                btn(`📰 ${homeTeam} News`, `${prefix}teamnews ${toSlug(homeTeam)}`),
                                btn(`📰 ${awayTeam} News`, `${prefix}teamnews ${toSlug(awayTeam)}`),
                                btn('⚽ Live Scores', `${prefix}scores`)
                            ]
                        }, { quoted: m })
                    } catch (e) {
                        return reply(msg.trim())
                    }
                    return
                }

                case 'sportnews':
                case 'footballnews': {
                    const { data } = await axios.get(`${API_BASE}?action=news`, { timeout: 15000 })
                    if (!data.success) return reply(`❌ ${data.message || 'Failed to fetch news'}`)

                    const articles = data.articles || []
                    if (!articles.length) return reply('📰 No sports news available.')

                    const top = articles.slice(0, 5)

                    try {
                        console.log(`[sportnews] Building ${top.length} carousel cards...`)
                        const carouselCards = await Promise.all(
                            top.map(async (a) => {
                                const cardButtons = []
                                if (a.url) cardButtons.push(urlBtn('📖 Read More', a.url))
                                const imgSource = a.image
                                    ? { image: { url: a.image } }
                                    : { image: createSportsCard(a.title, { type: a.type || 'news' }) }
                                return {
                                    header: {
                                        title: `📰 *${a.title}*`.slice(0, 60),
                                        hasMediaAttachment: true,
                                        imageMessage: (
                                            await generateWAMessageContent(
                                                imgSource,
                                                { upload: xcasper.waUploadToServer }
                                            )
                                        ).imageMessage
                                    },
                                    body: { text: a.title || '' },
                                    footer: { text: `> *${FOOTER}*` },
                                    nativeFlowMessage: {
                                        buttons: cardButtons
                                    }
                                }
                            })
                        )
                        console.log(`[sportnews] Cards built: ${carouselCards.length}, sending...`)

                        const carouselMsg = generateWAMessageFromContent(
                            from,
                            {
                                viewOnceMessage: {
                                    message: {
                                        messageContextInfo: {
                                            deviceListMetadata: {},
                                            deviceListMetadataVersion: 2
                                        },
                                        interactiveMessage: {
                                            body: { text: `📰 *Football News*\n📊 ${articles.length} articles` },
                                            footer: { text: `📂 Displaying first *${carouselCards.length}* articles` },
                                            carouselMessage: { cards: carouselCards }
                                        }
                                    }
                                }
                            },
                            { quoted: m }
                        )

                        await xcasper.relayMessage(from, carouselMsg.message, {
                            messageId: carouselMsg.key.id
                        })

                        console.log('[sportnews] Carousel sent successfully!')
                        await xcasper.sendMessage(from, { react: { text: '✅', key: m.key } })
                        return
                    } catch (e) {
                        console.error('Sportnews carousel error:', e)
                        await reply(`⚠️ Carousel error:\n\n${e.stack || e.message || e}`)
                    }

                    let msg = `📰 *Football News*\n📊 ${articles.length} articles\n\n`
                    for (let i = 0; i < top.length; i++) {
                        const a = top[i]
                        const label = a.label ? ` [${a.label.toUpperCase()}]` : ''
                        const typeIcon = a.type === 'video' ? '🎥' : a.type === 'live-blog' ? '📡' : '📰'
                        msg += `${typeIcon} *${i + 1}. ${a.title}*${label}\n`
                        if (a.url) msg += `🔗 ${a.url}\n`
                        msg += `\n`
                    }

                    const newsButtons = []
                    if (top[0]?.url) newsButtons.push(urlBtn('📖 Top Story', top[0].url))
                    if (top[1]?.url) newsButtons.push(urlBtn('📖 Story 2', top[1].url))
                    newsButtons.push(btn('🔄 Refresh', `${prefix}sportnews`))

                    try {
                        await sendButtons(xcasper, from, {
                            text: msg.trim(),
                            footer: FOOTER,
                            buttons: newsButtons
                        }, { quoted: m })
                    } catch (e) {
                        return reply(msg.trim())
                    }
                    return
                }

                case 'teamnews': {
                    if (!text) {
                        try {
                            await sendButtons(xcasper, from, {
                                text: `⚽ *Team News*\n\nSelect a team below to get the latest news, or type:\n\`${prefix}teamnews <team>\``,
                                footer: FOOTER,
                                buttons: [
                                    listBtn('📋 Select Team', [
                                        {
                                            title: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
                                            rows: [
                                                { title: '🔴 Arsenal', description: 'The Gunners', id: `${prefix}teamnews arsenal` },
                                                { title: '🟣 Aston Villa', description: 'The Villans', id: `${prefix}teamnews aston-villa` },
                                                { title: '🍒 Bournemouth', description: 'The Cherries', id: `${prefix}teamnews bournemouth` },
                                                { title: '🐝 Brentford', description: 'The Bees', id: `${prefix}teamnews brentford` },
                                                { title: '🔵 Brighton', description: 'The Seagulls', id: `${prefix}teamnews brighton-and-hove-albion` },
                                                { title: '🔵 Chelsea', description: 'The Blues', id: `${prefix}teamnews chelsea` },
                                                { title: '🦅 Crystal Palace', description: 'The Eagles', id: `${prefix}teamnews crystal-palace` },
                                                { title: '🔵 Everton', description: 'The Toffees', id: `${prefix}teamnews everton` },
                                                { title: '⚪ Fulham', description: 'The Cottagers', id: `${prefix}teamnews fulham` },
                                                { title: '🔴 Liverpool', description: 'The Reds', id: `${prefix}teamnews liverpool` },
                                            ]
                                        },
                                        {
                                            title: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 More PL Teams',
                                            rows: [
                                                { title: '🩵 Man City', description: 'The Citizens', id: `${prefix}teamnews manchester-city` },
                                                { title: '🔴 Man United', description: 'Red Devils', id: `${prefix}teamnews manchester-united` },
                                                { title: '⚫ Newcastle', description: 'The Magpies', id: `${prefix}teamnews newcastle-united` },
                                                { title: '🔴 Nottm Forest', description: 'The Tricky Trees', id: `${prefix}teamnews nottingham-forest` },
                                                { title: '🔵 Ipswich Town', description: 'The Tractor Boys', id: `${prefix}teamnews ipswich-town` },
                                                { title: '🔵 Leicester City', description: 'The Foxes', id: `${prefix}teamnews leicester-city` },
                                                { title: '⚪ Tottenham', description: 'Spurs', id: `${prefix}teamnews tottenham-hotspur` },
                                                { title: '⚒️ West Ham', description: 'The Hammers', id: `${prefix}teamnews west-ham-united` },
                                                { title: '🟠 Wolves', description: 'The Wanderers', id: `${prefix}teamnews wolverhampton-wanderers` },
                                                { title: '🔴 Sunderland', description: 'The Black Cats', id: `${prefix}teamnews sunderland` },
                                            ]
                                        },
                                        {
                                            title: '🌍 European Clubs',
                                            rows: [
                                                { title: '🔵🔴 Barcelona', description: 'La Liga', id: `${prefix}teamnews barcelona` },
                                                { title: '⚪ Real Madrid', description: 'La Liga', id: `${prefix}teamnews real-madrid` },
                                                { title: '🔴 Bayern Munich', description: 'Bundesliga', id: `${prefix}teamnews bayern-munich` },
                                                { title: '🔴🔵 PSG', description: 'Ligue 1', id: `${prefix}teamnews paris-saint-germain` },
                                                { title: '⚪⚫ Juventus', description: 'Serie A', id: `${prefix}teamnews juventus` },
                                                { title: '🔴⚫ AC Milan', description: 'Serie A', id: `${prefix}teamnews ac-milan` },
                                                { title: '🔵⚫ Inter Milan', description: 'Serie A', id: `${prefix}teamnews inter-milan` },
                                                { title: '🟡⚫ Dortmund', description: 'Bundesliga', id: `${prefix}teamnews borussia-dortmund` },
                                                { title: '🔵 Leeds United', description: 'Championship', id: `${prefix}teamnews leeds-united` },
                                                { title: '🔴 Burnley', description: 'Championship', id: `${prefix}teamnews burnley` },
                                            ]
                                        }
                                    ])
                                ]
                            }, { quoted: m })
                        } catch (e) {
                            console.log('[teamnews] List button error:', e.message)
                            return reply(`⚽ *Team News*\n\nUsage: ${prefix}teamnews <team>\nExample: ${prefix}teamnews arsenal\n\n📋 *Available Teams:*\narsenal, aston-villa, bournemouth, brentford, brighton-and-hove-albion, burnley, chelsea, crystal-palace, everton, fulham, ipswich-town, leeds-united, leicester-city, liverpool, manchester-city, manchester-united, newcastle-united, nottingham-forest, sunderland, tottenham-hotspur, west-ham-united, wolverhampton-wanderers, barcelona, real-madrid, bayern-munich, paris-saint-germain, juventus, ac-milan, inter-milan, borussia-dortmund`)
                        }
                        return
                    }

                    const team = toSlug(text)
                    const { data } = await axios.get(`${API_BASE}?action=teamnews&team=${encodeURIComponent(team)}`, { timeout: 15000 })
                    if (!data.success) return reply(`❌ ${data.message || 'Failed to fetch team news'}`)

                    const articles = data.articles || []
                    if (!articles.length) return reply(`📰 No news found for ${team}.`)

                    const teamDisplay = data.team?.name || team
                    const top = articles.slice(0, 8)
                    const cardsWithImages = top.filter(a => a.image)

                    if (cardsWithImages.length >= 2) {
                        try {
                            console.log(`[teamnews] Building ${cardsWithImages.length} carousel cards...`)
                            const carouselCards = await Promise.all(
                                cardsWithImages.slice(0, 5).map(async (a) => {
                                    const cardButtons = []
                                    if (a.url) cardButtons.push(urlBtn('📖 Read More', a.url))
                                    const imgSource = a.image
                                        ? { image: { url: a.image } }
                                        : { image: createSportsCard(a.title, { type: a.type || 'news' }) }
                                    return {
                                        header: {
                                            title: `📰 *${a.title}*`.slice(0, 60),
                                            hasMediaAttachment: true,
                                            imageMessage: (
                                                await generateWAMessageContent(
                                                    imgSource,
                                                    { upload: xcasper.waUploadToServer }
                                                )
                                            ).imageMessage
                                        },
                                        body: { text: a.title || '' },
                                        footer: { text: `> *${FOOTER}*` },
                                        nativeFlowMessage: {
                                            buttons: cardButtons
                                        }
                                    }
                                })
                            )
                            console.log(`[teamnews] Cards built: ${carouselCards.length}, sending...`)

                            const carouselMsg = generateWAMessageFromContent(
                                from,
                                {
                                    viewOnceMessage: {
                                        message: {
                                            messageContextInfo: {
                                                deviceListMetadata: {},
                                                deviceListMetadataVersion: 2
                                            },
                                            interactiveMessage: {
                                                body: { text: `📰 *${teamDisplay} News*\n📊 ${articles.length} articles` },
                                                footer: { text: `📂 Displaying first *${carouselCards.length}* articles` },
                                                carouselMessage: { cards: carouselCards }
                                            }
                                        }
                                    }
                                },
                                { quoted: m }
                            )

                            await xcasper.relayMessage(from, carouselMsg.message, {
                                messageId: carouselMsg.key.id
                            })

                            console.log('[teamnews] Carousel sent successfully!')
                            await xcasper.sendMessage(from, { react: { text: '✅', key: m.key } })
                            return
                        } catch (e) {
                            console.error('Teamnews carousel error:', e)
                            await reply(`⚠️ Carousel error:\n\n${e.stack || e.message || e}`)
                        }
                    }

                    let msg = `📰 *${teamDisplay} News*\n📊 ${articles.length} articles\n\n`
                    for (let i = 0; i < top.length; i++) {
                        const a = top[i]
                        const label = a.label ? ` [${a.label.toUpperCase()}]` : ''
                        const typeIcon = a.type === 'video' ? '🎥' : a.type === 'live-blog' ? '📡' : '📰'
                        msg += `${typeIcon} *${i + 1}. ${a.title}*${label}\n`
                        if (a.url) msg += `🔗 ${a.url}\n`
                        msg += `\n`
                    }

                    const teamNewsButtons = []
                    if (top[0]?.url) teamNewsButtons.push(urlBtn('📖 Top Story', top[0].url))
                    if (top[1]?.url) teamNewsButtons.push(urlBtn('📖 Story 2', top[1].url))
                    teamNewsButtons.push(btn('🔄 Refresh', `${prefix}teamnews ${team}`))

                    try {
                        await sendButtons(xcasper, from, {
                            text: msg.trim(),
                            footer: FOOTER,
                            buttons: teamNewsButtons
                        }, { quoted: m })
                    } catch (e) {
                        return reply(msg.trim())
                    }
                    return
                }

                default:
                    return reply('⚽ Unknown sports command.')
            }
        } catch (err) {
            console.error('Sports plugin error:', err.message)
            if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
                return reply('⏱️ Request timed out. Try again.')
            }
            return reply(`❌ Error: ${err.message}`)
        }
    }
}
