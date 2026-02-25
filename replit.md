# Test Project

## Overview
A Node.js/Express web application that clones the Casper-ultra WhatsApp Bot from GitLab and serves a static landing page.

## Project Architecture
- `index.js` - Express server entry point. Clones the Casper-ultra repo into `.npm/` on startup, then serves static files from `public/` on port 5000.
- `public/` - Static assets directory
  - `index.html` - Main HTML page
- `.npm/` - Hidden directory containing the cloned Casper-ultra bot (git-ignored)
- `package.json` - Node.js project config with Express dependency

## Running
The app starts with `node index.js` and serves on port 5000.

## Recent Changes
- 2025-02-25: Switched clone source from GitHub to GitLab, moved clone target to `.npm/` for concealment
- 2024-02-24: Initial setup with Express server and static HTML page
