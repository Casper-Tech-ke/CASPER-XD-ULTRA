# Test Project

## Overview
A simple Node.js/Express web application serving static files. On startup, it clones the Casper-ultra repository from GitLab into `casper-ultra/`.

## Project Architecture
- `index.js` - Express server entry point, clones Casper-ultra repo, serves static files from `public/`, binds to port 5000
- `public/` - Static assets directory
  - `index.html` - Main HTML page
- `casper-ultra/` - Cloned repository from GitLab (https://gitlab.com/Casper-Tech-ke/Casper-ultra)
- `package.json` - Node.js project config with Express dependency

## Running
The app starts with `node index.js` and serves on port 5000.

## Recent Changes
- 2026-02-25: Replaced obfuscated GitHub clone with clean GitLab clone (https://gitlab.com/Casper-Tech-ke/Casper-ultra)
- 2026-02-24: Initial setup with Express server and static HTML page