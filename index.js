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

let botProcess = null;
let botStatus = 'stopped';
let dbWatchers = [];

const DB_BACKUP_DIR = path.join(__dirname, '.db_backup');
const DB_FILES = ['database/casper.db', 'database/casper.db-shm', 'database/casper.db-wal', 'database/session.db', 'database/leaderboard.json', 'database/tebakgame.json'];

function backupDbFiles() {
  if (!fs.existsSync(DB_BACKUP_DIR)) {
    fs.mkdirSync(DB_BACKUP_DIR, { recursive: true });
  }
  for (const file of DB_FILES) {
    const src = path.join(BOT_DIR, file);
    const dest = path.join(DB_BACKUP_DIR, path.basename(file));
    if (fs.existsSync(src)) {
      try { fs.copyFileSync(src, dest); } catch (e) {}
    }
  }
}

function restoreDbFiles() {
  if (!fs.existsSync(DB_BACKUP_DIR)) return;
  const dbDir = path.join(BOT_DIR, 'database');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  for (const file of DB_FILES) {
    const src = path.join(DB_BACKUP_DIR, path.basename(file));
    const dest = path.join(BOT_DIR, file);
    if (fs.existsSync(src)) {
      try { fs.copyFileSync(src, dest); } catch (e) {}
    }
  }
}

function startDbWatchers() {
  stopDbWatchers();
  for (const file of DB_FILES) {
    const filePath = path.join(BOT_DIR, file);
    try {
      if (fs.existsSync(filePath)) {
        const watcher = fs.watch(filePath, { persistent: false }, () => {
          backupDbFiles();
        });
        dbWatchers.push(watcher);
      } else {
        const dir = path.dirname(filePath);
        if (fs.existsSync(dir)) {
          const watcher = fs.watch(dir, { persistent: false }, (eventType, filename) => {
            if (filename && DB_FILES.some(f => path.basename(f) === filename)) {
              backupDbFiles();
              startDbWatchers();
            }
          });
          dbWatchers.push(watcher);
        }
      }
    } catch (e) {}
  }
}

function stopDbWatchers() {
  for (const w of dbWatchers) {
    try { w.close(); } catch (e) {}
  }
  dbWatchers = [];
}

function cloneAndInstall() {
  if (fs.existsSync(NPM_DIR)) {
    fs.rmSync(NPM_DIR, { recursive: true, force: true });
  }

  try {
    fs.mkdirSync(BOT_DIR, { recursive: true });
    execSync(`git clone ${REPO_URL} ${BOT_DIR}`, { stdio: 'ignore' });
  } catch (e) {
    return false;
  }

  const envSource = path.join(__dirname, '.env');
  if (fs.existsSync(envSource)) {
    fs.copyFileSync(envSource, path.join(BOT_DIR, '.env'));
  }

  restoreDbFiles();

  try {
    execSync('npm install --production', { cwd: BOT_DIR, stdio: 'ignore' });
  } catch (e) {
    return false;
  }

  return true;
}

function startBot() {
  if (botProcess) {
    try { botProcess.kill(); } catch (e) {}
    botProcess = null;
  }

  const envSource = path.join(__dirname, '.env');
  if (fs.existsSync(envSource)) {
    fs.copyFileSync(envSource, path.join(BOT_DIR, '.env'));
  }

  try {
    botStatus = 'starting';
    botProcess = fork(path.join(BOT_DIR, 'index.js'), [], {
      cwd: BOT_DIR,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      env: { ...process.env }
    });

    let outputBuffer = [];

    botProcess.stdout.on('data', (data) => {
      const text = data.toString();
      process.stdout.write(text);
      outputBuffer.push(text);
      if (outputBuffer.length > 100) outputBuffer.shift();
    });

    botProcess.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    botProcess.on('error', () => { botStatus = 'error'; });
    botProcess.on('exit', (code) => {
      console.log(`Bot process exited with code ${code}`);
      botStatus = 'stopped';
      botProcess = null;
    });

    botStatus = 'running';
    startDbWatchers();
    return true;
  } catch (e) {
    botStatus = 'error';
    return false;
  }
}

function stopBot() {
  stopDbWatchers();
  backupDbFiles();
  if (botProcess) {
    try { botProcess.kill(); } catch (e) {}
    botProcess = null;
    botStatus = 'stopped';
  }
}

const ready = cloneAndInstall();
if (ready) startBot();

const os = require('os');
const botStartTime = Date.now();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ENV_PATH = path.join(__dirname, '.env');
const ENV_KEYS = [
  'SESSION', 'OWNER_NUMBERS', 'OWNER_NAME', 'BOT_NAME', 'BOT_MODE',
  'PREFIX', 'TIMEZONE', 'WELCOME', 'ADMIN_EVENT', 'AUTO_VIEW', 'AUTO_REACT',
  'PACK_NAME', 'STICKER_AUTHOR'
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

app.get('/api/bot/status', (req, res) => {
  res.json({ status: botStatus, pid: botProcess?.pid || null });
});

app.post('/api/bot/start', (req, res) => {
  if (botProcess) {
    return res.json({ success: false, message: 'Bot is already running' });
  }
  if (!fs.existsSync(path.join(BOT_DIR, 'package.json'))) {
    const ok = cloneAndInstall();
    if (!ok) return res.json({ success: false, message: 'Failed to setup bot' });
  }
  const ok = startBot();
  res.json({ success: ok, message: ok ? 'Bot started' : 'Failed to start bot' });
});

app.post('/api/bot/stop', (req, res) => {
  stopBot();
  res.json({ success: true, message: 'Bot stopped' });
});

app.post('/api/bot/restart', (req, res) => {
  stopBot();
  const envSource = path.join(__dirname, '.env');
  if (fs.existsSync(envSource)) {
    fs.copyFileSync(envSource, path.join(BOT_DIR, '.env'));
  }
  const ok = startBot();
  res.json({ success: ok, message: ok ? 'Bot restarted' : 'Failed to restart bot' });
});

app.post('/api/bot/pair', (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.json({ success: false, message: 'Phone number is required' });
  }

  const cleaned = phoneNumber.replace(/[^0-9]/g, '');
  if (cleaned.length < 10) {
    return res.json({ success: false, message: 'Invalid phone number' });
  }

  stopBot();

  const env = parseEnv(ENV_PATH);
  env.SESSION = '';
  writeEnv(ENV_PATH, env);
  fs.copyFileSync(ENV_PATH, path.join(BOT_DIR, '.env'));

  const dbPath = path.join(BOT_DIR, 'database', 'session.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  try {
    botStatus = 'pairing';
    botProcess = fork(path.join(BOT_DIR, 'index.js'), [], {
      cwd: BOT_DIR,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      env: { ...process.env }
    });

    let pairingCode = null;
    let resolved = false;

    botProcess.stdout.on('data', (data) => {
      const text = data.toString();
      process.stdout.write(text);

      const codeMatch = text.match(/PAIRING CODE:\s*([A-Z0-9-]+)/i);
      if (codeMatch && !resolved) {
        pairingCode = codeMatch[1];
        resolved = true;
      }
    });

    botProcess.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    botProcess.stdin.write(cleaned + '\n');

    setTimeout(() => {
      botProcess.stdin.write('1\n');
      setTimeout(() => {
        botProcess.stdin.write(cleaned + '\n');
      }, 1000);
    }, 500);

    const checkCode = setInterval(() => {
      if (pairingCode || resolved) {
        clearInterval(checkCode);
      }
    }, 500);

    setTimeout(() => {
      clearInterval(checkCode);
      if (pairingCode) {
        botStatus = 'running';
        botProcess.stdout.on('data', (data) => {
          process.stdout.write(data.toString());
        });
        res.json({ success: true, code: pairingCode, message: 'Enter this code in WhatsApp > Linked Devices > Link a Device' });
      } else {
        res.json({ success: false, message: 'Timed out waiting for pairing code. Check console for details.' });
      }
    }, 25000);

    botProcess.on('error', () => { botStatus = 'error'; });
    botProcess.on('exit', (code) => {
      botStatus = 'stopped';
      botProcess = null;
    });

  } catch (e) {
    res.json({ success: false, message: 'Failed to start pairing: ' + e.message });
  }
});

function getBotPackageInfo() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(BOT_DIR, 'package.json'), 'utf8'));
    return { name: pkg.name || 'CASPER-XD ULTRA', version: pkg.version || '1.0.0' };
  } catch (e) {
    return { name: 'CASPER-XD ULTRA', version: '1.0.0' };
  }
}

app.get('/api/stats', (req, res) => {
  const botUptime = Math.floor((Date.now() - botStartTime) / 1000);
  const sysUptime = Math.floor(os.uptime());
  const pkg = getBotPackageInfo();

  res.json({
    bot: {
      name: pkg.name,
      version: pkg.version,
      owner: 'TRABY-CASPER',
      team: 'CASPER TECH KENYA DEVELOPERS',
      uptime: botUptime,
      status: botStatus
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
