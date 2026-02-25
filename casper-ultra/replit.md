# CASPER-XD ULTRA

## Overview
CASPER-XD ULTRA is a WhatsApp bot built with Node.js using the baileys library (npm: baileys v7). It provides various features including AI chat, media downloading, sticker creation, group management, and more.

## Recent Changes
- 2026-02-21: Added chatbot auto-reply system (plugin/ai/chatbot.js) - per-chat enable/disable, text-only responses via pollinations API
- 2026-02-21: Chatbot branding: CASPER TECH KENYA DEVELOPERS, leader TRABY CASPER, GitHub Casper-Tech-ke, telegram casper_tech_ke
- 2026-02-21: Chatbot commands: .chatbot on/off/list/clear - owner/sudo only, auto-replies to text in enabled chats
- 2026-02-21: Chatbot filters: ignores reactions, stickers, images, commands, and bot's own messages
- 2026-02-21: Added comprehensive search plugin (plugin/search/search.js) - 26 API endpoints, 47 command aliases via xcasper.space
- 2026-02-21: Search categories: Web (google/ddg/brave), Music (spotify/lyrics/shazam/soundcloud/applemusic), Media (youtube/pinterest/unsplash/wallpaper/tiktok/stickers), Apps (playstore/apkpure/happymod), Other (weather/wattpad/wikimedia)
- 2026-02-21: Updated search menu with categorized sections (Web, Music, Media, Apps, Other)
- 2026-02-21: Added team name aliases (TEAM_ALIASES) for teamnews - supports nicknames like "man city", "spurs", "barca", abbreviations like "mufc", "lfc", "bvb"
- 2026-02-21: Added session management system - export/import full credentials as compressed "CASPER;;;" session strings
- 2026-02-21: loadSession() imports all credential keys (creds, pre-keys, sessions, etc.) into SQLite from gzipped base64 string
- 2026-02-21: exportSession() exports all credential rows from SQLite as compressed session string
- 2026-02-21: Added sports plugin - 9 commands (scores, fixtures, standings, topscorers, teamform, matchstats, analyze, sportnews, teamnews) via xcasper.space API
- 2026-02-21: Sports menu added to .menu system (.menu sports) with league alias support (epl, laliga, ucl, etc.)
- 2026-02-21: SESSION env var auto-loads session on startup if no existing registered session found
- 2026-02-21: Added .session command (export, import, forceimport, status) - owner only, export sent to DM for security
- 2026-02-21: Fixed global admin verification - robust JID matching handles LID/phone format differences
- 2026-02-21: Admin checks now use areJidsSameUser + number extraction + participant LID mapping for reliable matching
- 2026-02-21: groupMetadata failure now logs warning and gracefully defaults instead of silently breaking permissions
- 2026-02-20: Added ephoto effects system - 66+ text/photo effects via xcasper.space API (plugin/ephoto/ephoto.js)
- 2026-02-20: Ephoto menu integrated into .menu system (.menu ephoto) with categorized effects list
- 2026-02-20: Each effect usable as direct command (.neon, .3dwood, .marvel, etc.) or via .ephoto <effect> <text>
- 2026-02-20: Fixed smsg() crash on undefined m.msg for protocol/reaction messages (added null safety)
- 2026-02-20: Added pino logger output filtering for noisy decrypt/transaction errors
- 2026-02-20: Message logging now happens before mode filtering - all messages saved regardless of bot mode
- 2026-02-20: Fixed SQLite bind error - all message data explicitly typed (strings, ints, JSON)
- 2026-02-20: Built credential management system (credManager) in db.js with backup/restore/reset functions
- 2026-02-20: Added .creds command (stats, backup, restore, sessionreset, fullreset, fixkeys) - owner only with CONFIRM for destructive ops
- 2026-02-20: Fixed broken encryption by resetting pre-key counters and forcing fresh key generation/upload
- 2026-02-20: credManager stores backups in cred_backups table, validates pre-key counters on restore
- 2026-02-20: Fixed private chat LID display - smsg() and client.js now use remoteJidAlt (phone JID) when available instead of LID
- 2026-02-20: Suppressed libsignal "Closing session" console.log spam via targeted console.log filter at top of index.js
- 2026-02-20: Logger level set to "error" to reduce pino warn-level noise from baileys
- 2026-02-20: Added auto view status + auto react system - automatically views and reacts to WhatsApp statuses with emoji
- 2026-02-20: Added autoview_logs table to SQLite for tracking viewed/reacted statuses (max 200 entries)
- 2026-02-20: Added autoview/autoreact commands (on, off, stats, logs, clear) controllable by owner/sudo
- 2026-02-20: Added sudo system - trusted users stored in SQLite who can control the bot (addsudo, delsudo, listsudo, clearsudo)
- 2026-02-20: Permission hierarchy: Owner (full access) > Sudo (bot control, no eval/shell/sudo management) > User
- 2026-02-20: Refactored sudo system to dual-identifier (phone + LID) storage for WhatsApp LID addressing support
- 2026-02-20: isSudo check now uses checkAny() matching senderNumber, senderLid, and senderPhone
- 2026-02-20: Added isOwner, isSudo, managerCasper (isOwner OR isSudo) to plugin context
- 2026-02-20: Added SQLite database (better-sqlite3) for credentials, messages, and settings storage
- 2026-02-20: Replaced file-based auth (useMultiFileAuthState) with SQLite-based auth (useSQLiteAuthState)
- 2026-02-20: Added automatic message logging to SQLite on every incoming message
- 2026-02-20: Exposed global.db with messages, settings, and credentials ops for use in client.js
- 2026-02-20: Renamed bot from "Alicia WaBot" to "CASPER-XD ULTRA"
- 2026-02-20: Translated entire system from Indonesian to English
- 2026-02-20: Changed default timezone to EAT (Africa/Nairobi) with dynamic switching via settimezone command
- 2026-02-20: Added settimezone/settz/timezone/tz owner command - switch timezone by city name, stored in SQLite
- 2026-02-20: Removed all game features (tebak, leaderboard) and plugin management commands
- 2026-02-20: Fixed all locale references from Indonesian to English (months, days, date formats)
- 2026-02-20: Switched WhatsApp library from @whiskeysockets/baileys to baileys (npm: baileys v7) - updated all imports in index.js, client.js, library/lib/myfunc.js

## Project Architecture
- `index.js` - Main entry point, bot connection and event handling, plugin loader
- `client.js` - Menu display + default eval/exec (529 lines, stripped from 2760)
- `setting.js` - Global configuration (bot name, owner, messages, db globals)
- `package.json` - Dependencies
- `library/` - Helper libraries
  - `lib/myfunc.js` - Utility functions
  - `lib/exif.js` - Sticker EXIF handling
  - `menulist/` - Menu display modules (AI, tools, owner, etc.)
  - `scrape/` - Web scraping modules
- `plugin/` - Plugin-based command system (130+ plugins across 8 categories)
  - `ai/` - 32 AI chat plugins (chatgpt, deepseek, gemini, claude, etc.)
  - `downloader/` - Media downloaders (tiktok, instagram, facebook, mediafire, play)
  - `ephoto/` - 66+ text/photo effects via xcasper.space API (neon, 3d, logo, gold, etc.)
  - `group/` - Group management (manage, welcome)
  - `owner/` - Owner commands (botinfo, mode, prefix, sc, timezone, info)
  - `search/` - Search commands (anime, manga, wikimedia, etc.)
  - `sports/` - Live football data (scores, fixtures, standings, topscorers, teamform, matchstats, analyze, news)
  - `sticker/` - Sticker creation (sticker, brat, emojimix, quote, etc.)
  - `tools/` - Utility tools (server, net, totalfitur, magicstudio, etc.)
- `database/` - Database storage
  - `db.js` - SQLite database module (better-sqlite3) with credentials, messages, settings tables
  - `casper.db` - SQLite database file (auto-created)
- `media/` - Media assets (thumbnails)

## Database (SQLite)
- **credentials** table: Stores WhatsApp auth state (creds, keys) - replaces file-based session
- **messages** table: Logs all incoming messages (id, chat, sender, body, timestamp, raw_data) with composite primary key (id, chat)
- **settings** table: Key-value store for bot settings
- **sudos** table: Trusted sub-admin users (number, added_by, added_at)
- **cred_backups** table: Credential backup snapshots (tag, key, value, created_at)
- Access via `global.db.messages`, `global.db.settings`, `global.db.credentials`, `global.db.sudos`, `global.db.credManager` from any module

## User Preferences
- Bot name: CASPER-XD ULTRA
- Language: English (all responses)
- Owner: XyrooRynzz
- Socket variable: xcasper (lowercase)
- Default timezone: Africa/Nairobi (EAT), switchable via .settimezone command

## Running
Start with: `node index.js`
The bot will prompt for a WhatsApp number for pairing.
