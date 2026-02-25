# CASPER-XD ULTRA Bot

## Overview
A Node.js/Express web application that hosts the CASPER-XD ULTRA WhatsApp bot. It clones the bot from GitLab, installs dependencies, and starts the bot process. Includes a web dashboard for monitoring and a settings panel for configuration. All JavaScript code is heavily obfuscated for protection.

## Project Architecture
- `index.js` - Obfuscated main Express server (source in `src/index.js`)
- `public/` - Static frontend assets
  - `index.html` - Dashboard showing bot name, owner, uptime, and system stats
  - `settings.html` - Settings page for configuring bot env vars, bot controls, and WhatsApp pairing
  - `styles.css` - Main dashboard styles (dark theme)
  - `settings.css` - Settings page styles
  - `script.js` - Obfuscated dashboard JS (source in `src/script.js`)
  - `settings.js` - Obfuscated settings JS (source in `src/settings.js`)
- `src/` - Unobfuscated source files (git-ignored). Edit these, then run `node build.js` to re-obfuscate.
- `build.js` - Obfuscation build script (git-ignored). Uses javascript-obfuscator with heavy encryption.
- `.env` - Bot environment variables (SESSION, OWNER_NUMBERS, BOT_NAME, etc.)
- `.npm/` - Hidden directory containing the cloned bot (deeply nested path, git-ignored)

## Environment Variables (.env)
- `SESSION` - WhatsApp session string
- `OWNER_NUMBERS` - Comma-separated owner phone numbers
- `OWNER_NAME` - Owner display name (default: XyrooRynzz)
- `BOT_NAME` - Bot display name (default: CASPER-XD ULTRA)
- `BOT_MODE` - public or self
- `PREFIX` - Command prefix (default: .)
- `TIMEZONE` - Timezone (default: Africa/Nairobi)
- `WELCOME` - Enable welcome messages (true/false)
- `ADMIN_EVENT` - Admin event notifications (true/false)
- `AUTO_VIEW` - Auto-view WhatsApp statuses (true/false)
- `AUTO_REACT` - Auto-react to statuses (true/false)
- `PACK_NAME` - Sticker pack name
- `STICKER_AUTHOR` - Sticker author text

## API Endpoints
- `GET /api/stats` - Bot and system stats
- `GET /api/settings` - Read current settings
- `POST /api/settings` - Save settings to .env
- `GET /api/bot/status` - Bot process status
- `POST /api/bot/start` - Start bot
- `POST /api/bot/stop` - Stop bot
- `POST /api/bot/restart` - Restart bot with updated .env
- `POST /api/bot/pair` - Request WhatsApp pairing code

## Running
The app starts with `node index.js` on port 5000. On startup it silently clones the bot repo, installs deps, copies .env, and starts the bot.
