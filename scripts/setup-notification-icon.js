const fs = require('fs');
const path = require('path');

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyVectorIcon() {
  const projectRoot = process.cwd();
  const src = path.join(projectRoot, 'assets', 'ic_stat_aniua.xml');
  const dst = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'drawable', 'ic_stat_aniua.xml');

  if (!fs.existsSync(src)) {
    console.warn('[setup-notification-icon] Source vector icon not found:', src);
    return;
  }

  ensureDirSync(path.dirname(dst));
  fs.copyFileSync(src, dst);
  console.log('[setup-notification-icon] Copied notification icon to', dst);
}

copyVectorIcon();


