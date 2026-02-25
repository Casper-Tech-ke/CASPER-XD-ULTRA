const TEXT_FIELDS = ['SESSION', 'OWNER_NUMBERS', 'OWNER_NAME', 'BOT_NAME', 'BOT_MODE', 'PREFIX', 'TIMEZONE', 'PACK_NAME', 'STICKER_AUTHOR'];
const BOOL_FIELDS = ['WELCOME', 'ADMIN_EVENT', 'AUTO_VIEW', 'AUTO_REACT'];

async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();

    for (const key of TEXT_FIELDS) {
      const el = document.getElementById(key);
      if (el) el.value = data[key] || '';
    }

    for (const key of BOOL_FIELDS) {
      const el = document.getElementById(key);
      if (el) el.checked = data[key] === 'true';
    }
  } catch (e) {
    console.error('Failed to load settings');
  }
}

document.getElementById('settingsForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn = document.getElementById('saveBtn');
  const status = document.getElementById('saveStatus');
  btn.disabled = true;
  btn.textContent = 'Saving...';
  status.textContent = '';
  status.className = 'save-status';

  const payload = {};
  for (const key of TEXT_FIELDS) {
    const el = document.getElementById(key);
    if (el) payload[key] = el.value;
  }
  for (const key of BOOL_FIELDS) {
    const el = document.getElementById(key);
    if (el) payload[key] = el.checked ? 'true' : 'false';
  }

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      status.textContent = 'Settings saved! Restart the bot to apply changes.';
      status.className = 'save-status success';
    } else {
      status.textContent = 'Failed to save settings.';
      status.className = 'save-status error';
    }
  } catch (e) {
    status.textContent = 'Error saving settings.';
    status.className = 'save-status error';
  }

  btn.disabled = false;
  btn.textContent = 'Save Settings';
});

async function checkBotStatus() {
  try {
    const res = await fetch('/api/bot/status');
    const data = await res.json();
    const el = document.getElementById('botStatusText');
    el.textContent = data.status;
    el.className = 'bot-status-value ' + data.status;
  } catch (e) {
    document.getElementById('botStatusText').textContent = 'unknown';
  }
}

async function controlBot(action) {
  const statusEl = document.getElementById('controlStatus');
  const btns = document.querySelectorAll('.btn-control');
  btns.forEach(b => b.disabled = true);
  statusEl.textContent = action === 'start' ? 'Starting bot...' : action === 'stop' ? 'Stopping bot...' : 'Restarting bot...';

  try {
    const res = await fetch('/api/bot/' + action, { method: 'POST' });
    const data = await res.json();
    statusEl.textContent = data.message;
    statusEl.style.color = data.success ? '#00c896' : '#ff5a5a';
  } catch (e) {
    statusEl.textContent = 'Failed to ' + action + ' bot.';
    statusEl.style.color = '#ff5a5a';
  }

  btns.forEach(b => b.disabled = false);
  checkBotStatus();
}

async function requestPairing() {
  const phone = document.getElementById('pairPhone').value.trim();
  if (!phone) {
    document.getElementById('pairingResult').textContent = 'Please enter your phone number.';
    return;
  }

  const btn = document.getElementById('pairBtn');
  const resultEl = document.getElementById('pairingResult');
  const codeBox = document.getElementById('pairingCodeBox');
  btn.disabled = true;
  btn.textContent = 'Requesting pairing code...';
  resultEl.textContent = 'This may take up to 25 seconds. Please wait...';
  resultEl.style.color = '#f0a500';
  codeBox.style.display = 'none';

  try {
    const res = await fetch('/api/bot/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone })
    });
    const data = await res.json();

    if (data.success && data.code) {
      resultEl.textContent = '';
      codeBox.style.display = 'block';
      document.getElementById('pairingCode').textContent = data.code;
    } else {
      resultEl.textContent = data.message || 'Failed to get pairing code.';
      resultEl.style.color = '#ff5a5a';
    }
  } catch (e) {
    resultEl.textContent = 'Error requesting pairing code.';
    resultEl.style.color = '#ff5a5a';
  }

  btn.disabled = false;
  btn.textContent = 'Get Pairing Code';
  checkBotStatus();
}

loadSettings();
checkBotStatus();
setInterval(checkBotStatus, 5000);
