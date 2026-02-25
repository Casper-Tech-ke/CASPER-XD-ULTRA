function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (d > 0) parts.push(d + 'd');
  if (h > 0) parts.push(h + 'h');
  if (m > 0) parts.push(m + 'm');
  parts.push(s + 's');
  return parts.join(' ');
}

function formatBytes(bytes) {
  const gb = (bytes / (1024 * 1024 * 1024)).toFixed(2);
  return gb + ' GB';
}

function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 10 + 's';
    p.style.animationDuration = (Math.random() * 10 + 10) + 's';
    container.appendChild(p);
  }
}

let localBotUptime = 0;
let localSysUptime = 0;
let uptimeInterval = null;

function startLocalCounters(botUptime, sysUptime) {
  localBotUptime = botUptime;
  localSysUptime = sysUptime;
  if (uptimeInterval) clearInterval(uptimeInterval);
  uptimeInterval = setInterval(function () {
    localBotUptime++;
    localSysUptime++;
    document.getElementById('botUptime').textContent = formatUptime(localBotUptime);
    document.getElementById('sysUptime').textContent = formatUptime(localSysUptime);
  }, 1000);
}

async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();

    document.getElementById('statusBadge').querySelector('#statusText').textContent = 'Online';
    document.getElementById('botName').textContent = data.bot.name || 'CASPER-XD ULTRA';
    document.getElementById('botVersion').textContent = data.bot.version ? 'v' + data.bot.version : '';
    document.getElementById('ownerName').textContent = data.bot.owner;
    document.getElementById('teamName').textContent = data.bot.team;
    document.getElementById('platform').textContent = data.system.platform;
    document.getElementById('arch').textContent = data.system.arch;
    document.getElementById('cpu').textContent = data.system.cpus + 'x ' + data.system.cpuModel.split(' ').slice(0, 3).join(' ');
    document.getElementById('memory').textContent = formatBytes(data.system.freeMemory) + ' / ' + formatBytes(data.system.totalMemory);
    document.getElementById('hostname').textContent = data.system.hostname;
    document.getElementById('nodeVersion').textContent = data.system.nodeVersion;

    startLocalCounters(data.bot.uptime, data.system.uptime);
  } catch (e) {
    document.getElementById('statusBadge').querySelector('#statusText').textContent = 'Offline';
  }
}

createParticles();
fetchStats();
setInterval(fetchStats, 30000);
