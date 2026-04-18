/**
 * Integration test for the setup-games pipeline.
 *
 * Creates a real local git repo with a minimal "game", then runs
 * runSetupGames against it. Verifies that the full clone → build → copy
 * pipeline works and that caching skips rebuilds on a second run.
 *
 * No network access required — uses git init + local file path as the repo URL.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

jest.setTimeout(30000);

const GAME_ID = 'test-integration-game';
const GAME_TITLE = 'Integration Test Game';

let tmpDir: string;
let fakeRepoPath: string;
let publicGamesDir: string;
let publicThumbsDir: string;
let gameCacheDir: string;
let cacheFile: string;

let runSetupGames: (options?: Record<string, unknown>) => {
  gamesBuilt: number;
  gamesSkipped: number;
  gamesFailed: number;
};

beforeAll(async () => {
  // Create temp directory structure
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'setup-games-test-'));
  fakeRepoPath = path.join(tmpDir, 'fake-game-repo');
  publicGamesDir = path.join(tmpDir, 'public', 'staticGames');
  publicThumbsDir = path.join(tmpDir, 'public', 'gameThumbnails');
  gameCacheDir = path.join(tmpDir, '.game-sources');
  cacheFile = path.join(tmpDir, '.game-build-cache.json');

  // Set up a fake game repo
  fs.mkdirSync(fakeRepoPath, { recursive: true });
  fs.mkdirSync(path.join(fakeRepoPath, 'data'), { recursive: true });

  // package.json with a build script that copies index.html to dist/
  fs.writeFileSync(
    path.join(fakeRepoPath, 'package.json'),
    JSON.stringify({
      name: 'fake-game',
      version: '1.0.0',
      scripts: {
        build: 'mkdir -p dist && cp index.html dist/index.html',
      },
    }),
  );

  // The file that gets "built"
  fs.writeFileSync(
    path.join(fakeRepoPath, 'index.html'),
    '<html><body>Test Game</body></html>',
  );

  // Game metadata
  fs.writeFileSync(
    path.join(fakeRepoPath, 'data', 'game.json'),
    JSON.stringify({
      'game-id': GAME_ID,
      title: GAME_TITLE,
      subject: 'Technology',
      description: 'A test game for integration testing',
    }),
  );

  // Thumbnail (just a small text file standing in for a PNG)
  fs.writeFileSync(
    path.join(fakeRepoPath, 'data', 'thumbnail.png'),
    'fake-png-data',
  );

  // Generate package-lock.json (required by npm ci)
  execSync('npm install --package-lock-only', { cwd: fakeRepoPath });

  // Initialize as a git repo and commit
  execSync('git init -b main', { cwd: fakeRepoPath });
  execSync('git add .', { cwd: fakeRepoPath });
  execSync('git commit -m "initial commit"', {
    cwd: fakeRepoPath,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Test',
      GIT_AUTHOR_EMAIL: 'test@test.com',
      GIT_COMMITTER_NAME: 'Test',
      GIT_COMMITTER_EMAIL: 'test@test.com',
    },
  });

  // Import the refactored function
  const mod = await import('../setup-games.mjs');
  runSetupGames = mod.runSetupGames;
});

afterAll(() => {
  // Clean up temp directory
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

describe('setup-games integration', () => {
  it('clones, builds, and copies game files', () => {
    const result = runSetupGames({
      repoUrls: [fakeRepoPath],
      publicGamesDir,
      publicThumbsDir,
      cacheFile,
      gameCacheDir,
      forceRebuild: true,
      onGenerateData: () => {},
    });

    expect(result.gamesBuilt).toBe(1);
    expect(result.gamesFailed).toBe(0);

    // Verify built files were copied
    const gameOutputDir = path.join(publicGamesDir, GAME_ID);
    expect(fs.existsSync(gameOutputDir)).toBe(true);
    expect(fs.existsSync(path.join(gameOutputDir, 'index.html'))).toBe(true);

    const content = fs.readFileSync(
      path.join(gameOutputDir, 'index.html'),
      'utf-8',
    );
    expect(content).toContain('Test Game');
  });

  it('copies the thumbnail', () => {
    const thumbPath = path.join(publicThumbsDir, `${GAME_ID}.png`);
    expect(fs.existsSync(thumbPath)).toBe(true);
    expect(fs.readFileSync(thumbPath, 'utf-8')).toBe('fake-png-data');
  });

  it('writes the build cache with the commit hash', () => {
    expect(fs.existsSync(cacheFile)).toBe(true);
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    expect(cache[GAME_ID]).toBeDefined();
    expect(cache[GAME_ID]).toMatch(/^[a-f0-9]{40}$/);
  });

  it('skips rebuild on second run (cache hit)', () => {
    const result = runSetupGames({
      repoUrls: [fakeRepoPath],
      publicGamesDir,
      publicThumbsDir,
      cacheFile,
      gameCacheDir,
      forceRebuild: false,
      onGenerateData: () => {},
    });

    expect(result.gamesBuilt).toBe(0);
    expect(result.gamesSkipped).toBe(1);
    expect(result.gamesFailed).toBe(0);
  });

  it('rebuilds when --force is set despite cache', () => {
    const result = runSetupGames({
      repoUrls: [fakeRepoPath],
      publicGamesDir,
      publicThumbsDir,
      cacheFile,
      gameCacheDir,
      forceRebuild: true,
      onGenerateData: () => {},
    });

    expect(result.gamesBuilt).toBe(1);
    expect(result.gamesSkipped).toBe(0);
  });
});
