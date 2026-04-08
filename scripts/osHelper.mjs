import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export function run(cmd, cwd, timeout) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', timeout });
}

export function rmrf(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function copyDir(src, dest) {
  mkdirp(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
