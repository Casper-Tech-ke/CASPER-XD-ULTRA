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

const os = require('os');
const botStartTime = Date.now();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ENV_PATH = path.join(__dirname, '.env');
const ENV_KEYS = [
  'SESSION', 'OWNER_NUMBERS', 'OWNER_NAME', 'BOT_NAME', 'BOT_MODE',
  'PREFIX', 'TIMEZONE', 'WELCOME', 'ADMIN_EVENT', 'PACK_NAME', 'STICKER_AUTHOR'
];

function parseEnv(filePath) {
  const result = {};
  if (!fs.existsSync(filePath)) return result;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.substring(0, idx).trim();
    const val = trimmed.substring(idx + 1).trim();
    result[key] = val;
  }
  return result;
}

function writeEnv(filePath, data) {
  const lines = ENV_KEYS.map(key => `${key}=${data[key] || ''}`);
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
}

app.get('/api/settings', (req, res) => {
  const env = parseEnv(ENV_PATH);
  const settings = {};
  for (const key of ENV_KEYS) {
    settings[key] = env[key] || '';
  }
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  const current = parseEnv(ENV_PATH);
  for (const key of ENV_KEYS) {
    if (req.body[key] !== undefined) {
      current[key] = req.body[key];
    }
  }
  writeEnv(ENV_PATH, current);
  res.json({ success: true });
});

app.get('/api/stats', (req, res) => {
  const botUptime = Math.floor((Date.now() - botStartTime) / 1000);
  const sysUptime = Math.floor(os.uptime());

  res.json({
    bot: {
      name: 'CASPER-XD-ULTRA',
      owner: 'TRABY-CASPER',
      team: 'CASPER TECH KENYA DEVELOPERS',
      uptime: botUptime
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      cpuModel: os.cpus()[0]?.model || 'Unknown',
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: sysUptime,
      nodeVersion: process.version
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
