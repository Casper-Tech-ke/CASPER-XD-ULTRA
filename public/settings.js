const TEXT_FIELDS = ['SESSION', 'OWNER_NUMBERS', 'OWNER_NAME', 'BOT_NAME', 'BOT_MODE', 'PREFIX', 'TIMEZONE', 'PACK_NAME', 'STICKER_AUTHOR'];
const BOOL_FIELDS = ['WELCOME', 'ADMIN_EVENT'];

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

loadSettings();
