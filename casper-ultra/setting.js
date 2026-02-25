//═════════════════════════════════//

/*
CASPER-XD ULTRA System Framework
by XyrooRynzz • 2022 - 2026

>> Source Links:
・WhatsApp : wa.me/6281543496975
・WA Channel : whatsapp.com/channel/0029VaagYHwCnA82hDK7l31D
・Telegram : t.me/XyrooRynzz
*/

//═════════════════════════════════//
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Database
const { msgOps, settingsOps, credOps, sudoOps, credManager } = require('./database/db')
global.db = { messages: msgOps, settings: settingsOps, credentials: credOps, sudos: sudoOps, credManager }
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Owner Setting
global.owner = ["6281543496975", "254732982940"]
global.developer = ""
global.ownername = global.db.settings.get('ownername', 'XyrooRynzz')
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Bot Setting
global.botname = global.db.settings.get('botname', 'CASPER-XD ULTRA')
global.getBotVersion = () => { try { return require('./package.json').version; } catch { return '1.0.0'; } }
global.botver = global.getBotVersion()
global.idch = "120363299254074394@newsletter"
global.newsletterName = "X - Informations"
global.typebot = "Case X Plugin"
global.session = process.env.SESSION || ""
global.thumb = "https://files.catbox.moe/qbcebp.jpg"
global.wagc = "https://chat.whatsapp.com/JotecPIv9DGJDDTJ1wKt3l"
global.prefix = global.db.settings.get('prefix', '.')
global.botTimezone = global.db.settings.get('timezone', 'Africa/Nairobi')
global.botMode = global.db.settings.get('mode', 'public')
global.welcome = false
global.adminevent = false
global.groupCodes = []
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Sticker Marker
global.packname = global.db.settings.get('packname', global.botname)
global.author = global.db.settings.get('author', '© ' + global.ownername)
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Response Messages
global.mess = {
    success: '✅ Done.',
    admin: '🚨 Admin only.',
    botAdmin: '🤖 Make me admin first.',
    OnlyOwner: '👑 Owner only.',
    OnlyGrup: '👥 Group only.',
    private: '📩 Private chat only.',
    wait: '⏳ Processing...',
    error: '⚠️ Error occurred.',
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// File Update
let fs = require('fs')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update File 📁 : ${__filename}`)
delete require.cache[file]
require(file)
})