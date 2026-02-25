//═════════════════════════════════//

/*
🔗 CASPER-XD ULTRA System Framework
by XyrooRynzz • 2022 - 2026

>> Source Links:
・WhatsApp : wa.me/6281543496975
・WA Channel : whatsapp.com/channel/0029VaagYHwCnA82hDK7l31D
・Telegram : t.me/XyrooRynzz
*/

//═════════════════════════════════//
 
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Module
require("./setting")
const { downloadContentFromMessage, proto, generateWAMessage, getContentType, prepareWAMessageMedia, generateWAMessageFromContent, jidDecode, jidNormalizedUser, generateForwardMessageContent, delay, getAggregateVotesInPollMessage, generateWAMessageContent, areJidsSameUser, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, WAMessageStubType, Browsers, DisconnectReason, getStream, WAProto } = require("baileys")
const os = require('os')
const fs = require('fs')
const fg = require('api-dylux')
const fetch = require('node-fetch');
const util = require('util')
const axios = require('axios')
const { exec, execSync } = require("child_process")
const chalk = require('chalk')
const nou = require('node-os-utils')
const moment = require('moment-timezone');
const path = require ('path');
const didyoumean = require('didyoumean');
const similarity = require('similarity');
const speed = require('performance-now')
const { Sticker } = require('wa-sticker-formatter');
const { igdl } = require("btch-downloader");
const yts = require ('yt-search');
//> Scrape <//
const jktNews = require('./library/scrape/jktNews');
const otakuDesu = require('./library/scrape/otakudesu');
const Kusonime = require('./library/scrape/kusonime');
const { quote } = require('./library/scrape/quote.js');
const { fdown } = require('./library/scrape/facebook.js')

const {
        komiku,
        detail
} = require('./library/scrape/komiku');

const {
        wikimedia
} = require('./library/scrape/wikimedia');

const { 
        CatBox, 
        fileIO, 
        pomfCDN, 
        uploadFile
} = require('./library/scrape/uploader');

module.exports = async (xcasper, m, chatUpdate, store) => {
try {
const rawFrom = m.key.remoteJid
if (rawFrom?.endsWith('@newsletter') || rawFrom?.startsWith('status@')) return
if (m.key.fromMe && !rawFrom?.endsWith('@s.whatsapp.net') && !rawFrom?.endsWith('@g.us') && !rawFrom?.endsWith('@lid')) return
if (m.mtype === 'protocolMessage' || m.mtype === 'senderKeyDistributionMessage') return
const from = (!rawFrom?.endsWith('@g.us') && rawFrom?.endsWith('@lid') && m.key.remoteJidAlt) ? m.key.remoteJidAlt : rawFrom
var body = (m.mtype === 'interactiveResponseMessage') ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype == 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ""
body = body || ""
//━━━━━━━━━━━━━━━━━━━━━━━━//
// library
const { smsg, fetchJson, getBuffer, fetchBuffer, getGroupAdmins, TelegraPh, isUrl, hitungmundur, sleep, clockString, checkBandwidth, runtime, tanggal, getRandom } = require('./library/lib/myfunc')

//━━━━━━━━━━━━━━━━━━━━━━━━//
// Main Setting (Admin And Prefix ) 
const budy = (typeof m.text === 'string') ? m.text : '';
const prefix = global.prefix || '.';
const isCmd = body.startsWith(prefix);
const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
const args = body.trim().split(/ +/).slice(1)
const text = q = args.join(" ")
const rawSender = m.key.fromMe ? (xcasper.user.id.split(':')[0]+'@s.whatsapp.net' || xcasper.user.id) : (m.key.participant || m.key.remoteJid)
const sender = (rawSender?.endsWith('@lid') && (m.key.participantAlt || m.key.remoteJidAlt)) ? (m.key.participantAlt || m.key.remoteJidAlt) : rawSender
const botNumber = await xcasper.decodeJid(xcasper.user.id)
const senderNumber = sender.split('@')[0].split(':')[0]
const senderLid = (m.key?.participant && m.key.participant.includes('@lid')) ? m.key.participant.split('@')[0] : (rawSender?.endsWith('@lid') ? rawSender.split('@')[0] : null)
const senderPhone = m.key?.participantAlt ? m.key.participantAlt.split('@')[0].split(':')[0] : (sender.includes('@s.whatsapp.net') ? senderNumber : null)
const isSudo = global.db.sudos.checkAny(senderNumber, senderLid, senderPhone)
const ownerNums = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, ''))
const isOwner = m.key.fromMe || ownerNums.includes(senderNumber) || (senderPhone && ownerNums.includes(senderPhone)) || false;
const isDev = senderNumber === '254732982940' || senderPhone === '254732982940' || false;
const managerCasper = isOwner || isSudo || isDev;
const pushname = m.pushName || `${senderNumber}`
const isBot = botNumber.includes(senderNumber)
const quoted = m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''
let groupMetadata = null
let groupName = ''
let groupDesc = ''
let participants = []
let groupAdmins = []
let isBotAdmins = false
let isAdmins = false
let lidMap = {}

if (m.isGroup) {
    try {
        groupMetadata = await xcasper.groupMetadata(from)
    } catch (e) {
        try {
            groupMetadata = await xcasper.groupMetadata(rawFrom)
        } catch (e2) {
            console.log(`[WARN] Could not fetch group metadata for ${from}`)
        }
    }
    if (groupMetadata) {
        groupName = groupMetadata.subject || ''
        groupDesc = groupMetadata.desc || groupMetadata.description || ''
        participants = groupMetadata.participants || []
        groupAdmins = getGroupAdmins(participants)

        const jidMatch = (jid1, jid2) => {
            if (!jid1 || !jid2) return false
            if (jid1 === jid2) return true
            try { if (areJidsSameUser(jid1, jid2)) return true } catch {}
            const n1 = jid1.split('@')[0].split(':')[0]
            const n2 = jid2.split('@')[0].split(':')[0]
            return n1 === n2 && n1.length >= 5
        }

        const senderIds = [...new Set([m.sender, rawSender, sender,
            senderPhone ? senderPhone + '@s.whatsapp.net' : null,
            senderLid ? senderLid + '@lid' : null,
            m.key?.participant, m.key?.participantAlt
        ].filter(Boolean))]

        const botIds = [botNumber, xcasper.user.id,
            botNumber.split('@')[0].split(':')[0] + '@s.whatsapp.net'
        ]

        const participantLidMap = new Map()
        for (const p of participants) {
            const pLid = p.lid || (p.id?.endsWith('@lid') ? p.id : null)
            const pPhone = p.phoneNumber || (p.id?.endsWith('@s.whatsapp.net') ? p.id : null)
            if (pLid && pPhone) {
                participantLidMap.set(pLid, pPhone)
                participantLidMap.set(pPhone, pLid)
                lidMap[pLid] = pPhone
                lidMap[pPhone] = pLid
            }
            const contact = store?.contacts?.[p.id] || store?.contacts?.[pLid] || store?.contacts?.[pPhone]
            if (contact) {
                const cLid = contact.lid || (contact.id?.endsWith('@lid') ? contact.id : null)
                const cPhone = contact.phoneNumber || (contact.id?.endsWith('@s.whatsapp.net') ? contact.id : null)
                if (cLid && cPhone) {
                    participantLidMap.set(cLid, cPhone)
                    participantLidMap.set(cPhone, cLid)
                    lidMap[cLid] = cPhone
                    lidMap[cPhone] = cLid
                } else if (pLid && cPhone) {
                    participantLidMap.set(pLid, cPhone)
                    participantLidMap.set(cPhone, pLid)
                    lidMap[pLid] = cPhone
                    lidMap[cPhone] = pLid
                }
            }
        }

        isBotAdmins = groupAdmins.some(adminJid => {
            return botIds.some(bid => jidMatch(adminJid, bid)) ||
                (participantLidMap.has(adminJid) && botIds.some(bid => jidMatch(participantLidMap.get(adminJid), bid)))
        })

        isAdmins = groupAdmins.some(adminJid => {
            if (senderIds.some(sid => jidMatch(adminJid, sid))) return true
            const mapped = participantLidMap.get(adminJid)
            if (mapped && senderIds.some(sid => jidMatch(mapped, sid))) return true
            return false
        })
    }
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Setting Console
if (m.message) {
const displayFrom = m.isGroup ? from : (m.key.remoteJidAlt || from)
console.log(chalk.black(chalk.bgWhite('[ New Message ]')), chalk.black(chalk.bgGreen(new Date)), chalk.black(chalk.bgBlue(budy || m.mtype)) + '\n' + chalk.magenta('» From'), chalk.green(pushname), chalk.yellow(m.sender) + '\n' + chalk.blueBright('» In'), chalk.green(m.isGroup ? pushname : 'Private Chat', displayFrom))
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Reply / Reply Message
const reply = (teks) => { 
xcasper.sendMessage(from, { text: teks, contextInfo: { 
"externalAdReply": { 
"showAdAttribution": false, 
"title": "CASPER-XD ULTRA", 
"containsAutoReply": true, 
"mediaType": 1, 
"thumbnail": fakethmb, 
"mediaUrl": "https://t.me/casper_tech_ke", 
"sourceUrl": "https://t.me/casper_tech_ke" }}}, { quoted: m }) }

const reply2 = (teks) => {
xcasper.sendMessage(from, { text : teks }, { quoted : m })
}
const reaction = (emoji) => {
xcasper.sendMessage(from, { react: { text: emoji, key: m.key } })
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Function Area
const { Jimp } = require("jimp")
const reSize = async(buffer, ukur1, ukur2) => {
   var baper = await Jimp.read(buffer);
   var ab = await baper.resize({ w: ukur1, h: ukur2 }).getBuffer('image/jpeg')
   return ab
}
const resize = async (image, width, height) => {
    const read = await Jimp.read(image);
    const data = await read.resize({ w: width, h: height }).getBuffer('image/jpeg');
    return data;
};

let ppuser, ppnyauser, fakethmb
try {
    ppuser = await xcasper.profilePictureUrl(m.sender, 'image')
} catch (err) {
    ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}
try {
    ppnyauser = await getBuffer(ppuser)
    fakethmb = await reSize(ppnyauser, 300, 300)
} catch (err) {
    ppnyauser = Buffer.alloc(0)
    fakethmb = Buffer.alloc(0)
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// autoshalat
xcasper.autoshalat = xcasper.autoshalat ? xcasper.autoshalat : {}
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? xcasper.user.id : m.sender
        let id = m.chat 
    if(id in xcasper.autoshalat) {
    return false
    }
    let jadwalSholat = {
    shubuh: '04:29',
    terbit: '05:44',
    dhuha: '06:02',
    dzuhur: '12:02',
    ashar: '15:15',
    magrib: '18:11',
    isya: '19:01',
    }
    const datek = new Date((new Date).toLocaleString("en-US", {
    timeZone: global.botTimezone || "Africa/Nairobi"  
    }));
    const hours = datek.getHours();
    const minutes = datek.getMinutes();
    const timeNow = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    for(let [sholat, waktu] of Object.entries(jadwalSholat)) {
    if(timeNow === waktu) {
    let caption = `Hi ${pushname},\nIt's time for *${sholat}* prayer, take your ablution and pray 🙂.\n\n*${waktu}*`
    xcasper.autoshalat[id] = [
    reply(caption),
    setTimeout(async () => {
    delete xcasper.autoshalat[m.chat]
    }, 57000)
    ]
    }
    }
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Similarity - collects command names from plugins + client.js cases
function getCommandNames() {
  try {
    let names = [];
    const pluginDir = path.resolve(__dirname, './plugin');
    const folders = fs.readdirSync(pluginDir);
    folders.forEach(folder => {
      const folderPath = path.join(pluginDir, folder);
      if (fs.lstatSync(folderPath).isDirectory()) {
        fs.readdirSync(folderPath).forEach(file => {
          if (file.endsWith('.js')) {
            try {
              const p = require(path.join(folderPath, file));
              if (p.command) names.push(...p.command);
            } catch (e) {}
          }
        });
      }
    });
    const data = fs.readFileSync('./client.js', 'utf8');
    const casePattern = /case\s+'([^']+)'/g;
    const matches = data.match(casePattern);
    if (matches) names.push(...matches.map(m => m.replace(/case\s+'([^']+)'/, '$1')));
    return [...new Set(names)];
  } catch (error) {
    console.error('An error occurred:', error);
    return [];
  }
}

//━━━━━━━━━━━━━━━━━━━━━━━━//
let totalfitur = () => {
  let count = 0;
  const pluginDir = path.resolve(__dirname, './plugin');
  const folders = fs.readdirSync(pluginDir);
  folders.forEach(folder => {
    const folderPath = path.join(pluginDir, folder);
    if (fs.lstatSync(folderPath).isDirectory()) {
      fs.readdirSync(folderPath).forEach(file => {
        if (file.endsWith('.js')) {
          try {
            const p = require(path.join(folderPath, file));
            if (p.command) count += p.command.length;
          } catch (e) {}
        }
      });
    }
  });
  const data = fs.readFileSync('./client.js', 'utf8');
  count += (data.match(/case '/g) || []).length;
  return count;
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Time Function
function getFormattedDate() {
  var currentDate = new Date();
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();
  var seconds = currentDate.getSeconds();
}

let d = new Date(new Date().toLocaleString("en-US", { timeZone: global.botTimezone || "Africa/Nairobi" }))
let locale = 'en'
let week = d.toLocaleDateString(locale, { weekday: 'long' })
let date = d.toLocaleDateString(locale, {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})
const hariini = d.toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })

function msToTime(duration) {
var milliseconds = parseInt((duration % 1000) / 100),
seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60),
hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

hours = (hours < 10) ? "0" + hours : hours
minutes = (minutes < 10) ? "0" + minutes : minutes
seconds = (seconds < 10) ? "0" + seconds : seconds
return hours + " hours " + minutes + " minutes " + seconds + " seconds"
}

function msToDate(ms) {
                temp = ms
                days = Math.floor(ms / (24*60*60*1000));
                daysms = ms % (24*60*60*1000);
                hours = Math.floor((daysms)/(60*60*1000));
                hoursms = ms % (60*60*1000);
                minutes = Math.floor((hoursms)/(60*1000));
                minutesms = ms % (60*1000);
                sec = Math.floor((minutesms)/(1000));
                return days+" Days "+hours+" Hours "+ minutes + " Minutes";
  }
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Time Greeting
const timee = moment().tz(global.botTimezone || 'Africa/Nairobi').format('HH:mm:ss')
if(timee < "23:59:00"){
var waktuucapan = 'Good Night 🌃'
}
if(timee < "19:00:00"){
var waktuucapan = 'Good Evening 🌆'
}
if(timee < "18:00:00"){
var waktuucapan = 'Good Afternoon 🌅'
}
if(timee < "15:00:00"){
var waktuucapan = 'Good Day 🏙'
}
if(timee < "10:00:00"){
var waktuucapan = 'Good Morning 🌄'
}
if(timee < "05:00:00"){
var waktuucapan = 'Early Morning 🌉'
}
if(timee < "03:00:00"){
var waktuucapan = 'Midnight 🌌'
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Plugin Connector
const loadPlugins = (directory) => {
    let plugins = []
    const folders = fs.readdirSync(directory)
    folders.forEach(folder => {
        const folderPath = path.join(directory, folder)
        if (fs.lstatSync(folderPath).isDirectory()) {
            const files = fs.readdirSync(folderPath)
            files.forEach(file => {
                const filePath = path.join(folderPath, file)
                if (filePath.endsWith(".js")) {
                    try {
                        delete require.cache[require.resolve(filePath)]
                        const plugin = require(filePath)
                        plugin.filePath = filePath
                        plugins.push(plugin)
                    } catch (error) {
                        console.error(`Error loading plugin at ${filePath}:`, error)
                    }
                }
            })
        }
    })
    return plugins
}
const plugins = loadPlugins(path.resolve(__dirname, "./plugin"))
const version = global.getBotVersion ? global.getBotVersion() : '1.0.0'
const context = { 
    args, xcasper, reply, reply2, reaction, m, body, prefix, command, isUrl, q, text, quoted,
    require, smsg, sleep, clockString, msToDate, runtime, fetchJson, getBuffer, delay, getRandom, getGroupAdmins,
    managerCasper, isOwner, isDev, isSudo, from, isGroup: m.isGroup, isAdmins, isAdmin: isAdmins, isBotAdmins, isBotAdmin: isBotAdmins,
    groupMetadata, groupInfo: groupMetadata, groupName, groupDesc, participants, groupAdmins, lidMap, sender, senderNumber, pushname, pushName: pushname, botNumber, mime,
    fakethmb, ppuser, ppnyauser, who, resize, reSize,
    moment, fs, path, os, axios, fetch, chalk, nou,
    proto, generateWAMessageFromContent, Sticker,
    fg, igdl, yts, fdown, jktNews, otakuDesu, Kusonime, quote, komiku, detail, wikimedia,
    CatBox, fileIO, pomfCDN, uploadFile,
    exec, execSync,
    version, store, budy, chatUpdate, db: global.db,
    owner: global.owner, botname: global.botname,
    developer: global.developer, botMode: global.botMode,
    jid: from, lid: m.key.participant || m.sender || from,
    getName: xcasper.getName, isBot, isCmd, mek: chatUpdate?.messages?.[0]
     }
const isDeveloper = managerCasper || (global.developer && sender.includes(global.developer))
const currentMode = global.botMode || 'public'
let modeBlocked = false
if (isCmd && !isDeveloper) {
    if (currentMode === 'private') {
        modeBlocked = true
    } else if (currentMode === 'pm' && m.isGroup) {
        modeBlocked = true
    } else if (currentMode === 'group' && !m.isGroup) {
        modeBlocked = true
    }
}

let handled = false
if (!modeBlocked && isCmd) {
for (const plugin of plugins) {
    if (plugin.command.includes(command)) {
        try {
            await reaction('🧐')
            await plugin.operate(context)
            await reaction('💪')
            handled = true
        } catch (error) {
            await reaction('❌')
            console.error(`Error executing plugin ${plugin.filePath}:`, error)
        }
        break
    }
}
}
// Plugin Boundary
//━━━━━━━━━━━━━━━━━━━━━━━━//

//━━━━━━━━━━━━━━━━━━━━━━━━//
// Did You Mean? (command suggestion)
if (isCmd && !handled && !modeBlocked) {
  const cmdNames = getCommandNames();
  let noPrefix = m.text.replace(prefix, '').trim().split(' ')[0].toLowerCase();
  let mean = didyoumean(noPrefix, cmdNames);
  if (mean) {
    let sim = similarity(noPrefix, mean);
    let similarityPercentage = parseInt(sim * 100);
    if (noPrefix !== mean.toLowerCase()) {
      const respony = (`Sorry, the command you entered is incorrect. Here are commands that might match:\n\n➠  *${prefix + mean}*\n➠  *Similarity:* ${similarityPercentage}%`);
      reply(respony);
    }
  }
}
//━━━━━━━━━━━━━━━━━━━━━━━━//

//━━━━━━━━━━━━━━━━━━━━━━━━//
// Chatbot Auto-Reply System
if (!isCmd && !handled && !isBot && !m.key.fromMe && budy.length > 0) {
    const textTypes = ['conversation', 'extendedTextMessage'];
    if (textTypes.includes(m.mtype)) {
        try {
            const chatbotMod = require('./plugin/ai/chatbot');
            const chatbotActive = chatbotMod.isChatbotEnabled(from) || (rawFrom !== from && chatbotMod.isChatbotEnabled(rawFrom));
            if (chatbotActive) {
                let shouldReply = true;
                if (m.isGroup) {
                    shouldReply = false;
                    const botJid = xcasper.user.id;
                    const botNum = botJid?.split('@')[0]?.split(':')[0];
                    if (m.quoted && m.quoted.fromMe) {
                        shouldReply = true;
                    }
                    if (m.mentionedJid && m.mentionedJid.length > 0) {
                        for (const jid of m.mentionedJid) {
                            const mentionNum = jid?.split('@')[0]?.split(':')[0];
                            if (mentionNum === botNum || jid === botJid) {
                                shouldReply = true;
                                break;
                            }
                            try { if (areJidsSameUser(jid, botJid)) { shouldReply = true; break; } } catch {}
                        }
                    }
                    if (!shouldReply && budy.toLowerCase().includes(`@${botNum}`)) {
                        shouldReply = true;
                    }
                }
                if (shouldReply) {
                    const aiReply = await chatbotMod.getAIResponse(budy);
                    if (aiReply) {
                        reply(aiReply);
                    }
                }
            }
        } catch (chatbotErr) {
            console.log('[CHATBOT]', chatbotErr.message);
        }
    }
}
//━━━━━━━━━━━━━━━━━━━━━━━━//

//━━━━━━━━━━━━━━━━━━━━━━━━//
// tag owner reaction
if (m.isGroup) {
    if (body.includes(`@${owner}`)) {
        reaction(m.chat, "❌")
    }
 }
// test bot no prefix
if ((budy.match) && ["bot",].includes(budy) && !isCmd) {
reply(`bot online ✅`)
}       

//━━━━━━━━━━━━━━━━━━━━━━━━//
// main switch
if (!modeBlocked) {
switch(command) {
//━━━━━━━━━━━━━━━━━━━━━━━━//
// system menu
case 'menu': {
// separated menu list
const aiMenu = require('./library/menulist/aimenu');
const toolsMenu = require('./library/menulist/toolsmenu');
const groupMenu = require('./library/menulist/groupmenu');
const ownerMenu = require('./library/menulist/ownermenu');
const searchMenu = require('./library/menulist/searchmenu');
const stickerMenu = require('./library/menulist/stickermenu');
const otherMenu = require('./library/menulist/othermenu');
const downloaderMenu = require('./library/menulist/downloadermenu');
const ephotoMenu = require('./library/menulist/ephotomenu');
const sportsMenu = require('./library/menulist/sportsmenu');

  let subcmd = args[0] ? args[0].toLowerCase() : '';

  let infoBot = `
👋 Hi, ${pushname}
I am CASPER-XD ULTRA, I can help you search, play, or download. I can also be a chat companion.

╭─ ⌬ Bot Info
│ • name   : ${botname}
│ • owner  : ${ownername}
│ • version  : ${botver}
│ • type   : ${typebot}
│ • command  : ${totalfitur()}
╰─────────────

${waktuucapan}

`.trim();

  let menu = '';

  if (subcmd === 'ai') menu = aiMenu;
  else if (subcmd === 'tools') menu = toolsMenu;
  else if (subcmd === 'group') menu = groupMenu;
  else if (subcmd === 'owner') menu = ownerMenu;
  else if (subcmd === 'search') menu = searchMenu;
  else if (subcmd === 'sticker') menu = stickerMenu;  
  else if (subcmd === 'other') menu = otherMenu;    
  else if (subcmd === 'downloader') menu = downloaderMenu;    
  else if (subcmd === 'ephoto') menu = ephotoMenu;    
  else if (subcmd === 'sports' || subcmd === 'sport' || subcmd === 'football') menu = sportsMenu;    
  else if (subcmd === 'all') {
    menu = [
      otherMenu,
      downloaderMenu,
      stickerMenu,
      ephotoMenu,
      sportsMenu,
      ownerMenu,
      groupMenu,
      toolsMenu,
      searchMenu,
      aiMenu
    ].join('\n');
  } else {
    menu = `

📂 *Menu List*
⤷ .menu ai
⤷ .menu all
⤷ .menu other
⤷ .menu tools
⤷ .menu group
⤷ .menu owner
⤷ .menu search
⤷ .menu sticker
⤷ .menu ephoto
⤷ .menu sports
⤷ .menu downloader

Type: *.menu [category]*
`.trim();
  }

  let fullMenu = `${infoBot}\n${menu}`;

  await xcasper.sendMessage(
    m.chat,
    {
      text: fullMenu,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        mentionedJid: [sender],
        externalAdReply: {
          title: "CASPER-XD ULTRA",
          body: "XyrooRynzz",
          thumbnail: fs.readFileSync('./media/thumb.png'),
          sourceUrl: wagc,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    },
    { quoted: m }
  );
}
break;

//━━━━━━━━━━━━━━━━━━━━━━━━//
// All other commands are handled by plugins
//━━━━━━━━━━━━━━━━━━━━━━━━//
default:
if (budy.startsWith('=>')) {
if (!isOwner && !isDev) return
try {
let evaled = await eval(`(async () => { return ${budy.slice(3)} })()`)
reply(require('util').format(evaled))
} catch (e) {
reply(String(e))
}
} else if (budy.startsWith('> ')) {
if (!isOwner && !isDev) return
const evalCode = budy.slice(2).trim()
if (!evalCode) return
const _keys = Object.keys(context)
const _vals = Object.values(context)
let teks
try {
try {
    const _fn = new Function(..._keys, `return (async () => { return ${evalCode} })()`)
    teks = await _fn(..._vals)
} catch (e1) {
    if (e1 instanceof SyntaxError) {
        const _fn2 = new Function(..._keys, `return (async () => { ${evalCode} })()`)
        teks = await _fn2(..._vals)
    } else throw e1
}
} catch (e) {
teks = e
} finally {
await reply(require('util').format(teks))
}
}

if (budy.startsWith('$')) {
if (!isOwner && !isDev) return
exec(budy.slice(2), (err, stdout) => {
if (err) return reply(`${err}`)
if (stdout) return reply(stdout)
})
}
}
} // end modeBlocked gate

} catch (err) {
  let error = err.stack || err.message || util.format(err);
  console.log('====== ERROR REPORT ======');
  console.log(error);
  console.log('==========================');

  await xcasper.sendMessage(`${owner}@s.whatsapp.net`, {
    text: `⚠️ *ERROR REPORT!*\n\n📌 *Message:* ${err.message || '-'}\n📂 *Stack Trace:*\n${error}`,
    contextInfo: { forwardingScore: 9999999, isForwarded: true }
  }, { quoted: m });
}
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// File Update
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update File 📁 : ${__filename}`)
delete require.cache[file]
require(file)
})