const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const REPO_URL = 'https://github.com/Casper-Tech-ke/Casper-ultra';
const TARGET_DIR = path.join(__dirname, '.internal', 'system', 'bin', 'casper-core');

function download() {
  console.log('Starting secure download...');

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('Error: GITHUB_TOKEN environment variable is not set.');
    process.exit(1);
  }

  try {
    // Create hidden nested directory structure
    if (!fs.existsSync(TARGET_DIR)) {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    // Construct authenticated URL
    const authenticatedUrl = REPO_URL.replace('https://', `https://${token}@`);

    console.log('Cloning repository into hidden path...');
    execSync(`git clone ${authenticatedUrl} ${TARGET_DIR}`, { stdio: 'inherit' });

    console.log('Download completed successfully.');
    console.log(`Core components initialized in hidden directory.`);
    
    // Optional: Remove .git directory from the downloaded repo to further hide its origin
    const gitDir = path.join(TARGET_DIR, '.git');
    if (fs.existsSync(gitDir)) {
      execSync(`rm -rf ${gitDir}`);
    }

  } catch (error) {
    console.error('Download failed:', error.message);
    process.exit(1);
  }
}

download();
