const express = require('express');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = 5000;

const REPO_URL = 'https://gitlab.com/Casper-Tech-ke/Casper-ultra';

function cloneRepo() {
  const targetDir = path.join(__dirname, 'casper-ultra');
  if (fs.existsSync(targetDir)) return;

  try {
    console.log('Cloning Casper-ultra from GitLab...');
    fs.mkdirSync(targetDir, { recursive: true });
    execSync(`git clone ${REPO_URL} ${targetDir}`, { stdio: 'inherit' });
    console.log('Clone complete.');
  } catch (e) {
    console.error('Failed to clone repository:', e.message);
  }
}

cloneRepo();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
