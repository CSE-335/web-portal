import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { getConfiguredGameRepos } from './gameSources.mjs';

const hash = createHash('sha256');

for (const repoUrl of getConfiguredGameRepos()) {
  const output = execSync(`git ls-remote ${repoUrl} refs/heads/main`, { encoding: 'utf-8' }).trim();
  const commit = output.split(/\s+/)[0];

  if (!commit) {
    throw new Error(`Could not resolve refs/heads/main for ${repoUrl}`);
  }

  hash.update(repoUrl);
  hash.update(commit);
}

process.stdout.write(hash.digest('hex'));
