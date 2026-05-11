import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { getConfiguredGameRepos } from './gameSources.mjs';

const hash = createHash('sha256');

for (const repoUrl of getConfiguredGameRepos()) {
  try {
    const output = execSync(`git ls-remote ${repoUrl} refs/heads/main`, { encoding: 'utf-8', timeout: 15000 }).trim();
    const commit = output.split(/\s+/)[0];

    if (commit) {
      hash.update(repoUrl);
      hash.update(commit);
    } else {
      console.warn(`Could not resolve refs/heads/main for ${repoUrl}, skipping`);
      hash.update(repoUrl);
      hash.update('unknown');
    }
  } catch {
    console.warn(`Failed to reach ${repoUrl}, using fallback hash`);
    hash.update(repoUrl);
    hash.update('unreachable');
  }
}

process.stdout.write(hash.digest('hex'));
