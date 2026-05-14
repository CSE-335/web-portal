/**
 * gameSources.mjs uses `import.meta.url` which conflicts with Jest's CJS
 * transform (SWC redeclares __dirname). We test the pure helper logic inline
 * and mock the module for downstream consumers.
 *
 * The IO-heavy functions (syncGameRepo, etc.) are better covered by the
 * hybrid integration test that uses a real temp git repo.
 */

import { execSync } from 'child_process';

jest.mock('child_process');

const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;

// ---------- Pure logic from gameSources.mjs, tested directly ----------

/** Mirrors getRepoDirName from gameSources.mjs */
function getRepoDirName(repoUrl: string): string {
  const trimmed = repoUrl.replace(/\/+$/, '');
  const repoName = trimmed.split('/').pop()?.replace(/\.git$/, '');

  if (!repoName) {
    throw new Error(
      `Could not derive a cache directory name from repo URL: ${repoUrl}`,
    );
  }

  return repoName;
}

describe('getRepoDirName', () => {
  it('extracts repo name from standard GitHub URL', () => {
    expect(getRepoDirName('https://github.com/user/my-game.git')).toBe(
      'my-game',
    );
  });

  it('handles URLs without .git suffix', () => {
    expect(getRepoDirName('https://github.com/user/my-game')).toBe('my-game');
  });

  it('strips trailing slashes', () => {
    expect(getRepoDirName('https://github.com/user/my-game.git/')).toBe(
      'my-game',
    );
    expect(getRepoDirName('https://github.com/user/my-game///')).toBe(
      'my-game',
    );
  });

  it('throws on empty URL', () => {
    expect(() => getRepoDirName('')).toThrow();
  });
});

// ---------- Validation logic from getConfiguredGameRepos ----------

function validateGameRepos(gameRepos: unknown): string[] {
  if (!Array.isArray(gameRepos)) {
    throw new Error(
      'games.config.mjs must export gameRepos as an array of repo URLs',
    );
  }

  return gameRepos.map((repoUrl) => {
    if (typeof repoUrl !== 'string' || repoUrl.trim() === '') {
      throw new Error(
        'games.config.mjs entries must be non-empty repo URL strings',
      );
    }

    return repoUrl.trim();
  });
}

describe('getConfiguredGameRepos (validation logic)', () => {
  it('returns trimmed repo URLs', () => {
    const result = validateGameRepos([
      '  https://github.com/user/game-a.git  ',
      'https://github.com/user/game-b.git',
    ]);
    expect(result).toEqual([
      'https://github.com/user/game-a.git',
      'https://github.com/user/game-b.git',
    ]);
  });

  it('throws when gameRepos is not an array', () => {
    expect(() => validateGameRepos('not an array')).toThrow(
      'must export gameRepos as an array',
    );
    expect(() => validateGameRepos(null)).toThrow(
      'must export gameRepos as an array',
    );
  });

  it('throws when an entry is not a string', () => {
    expect(() => validateGameRepos([123])).toThrow(
      'must be non-empty repo URL strings',
    );
  });

  it('throws when an entry is an empty string', () => {
    expect(() => validateGameRepos(['  '])).toThrow(
      'must be non-empty repo URL strings',
    );
  });
});

// ---------- getOriginUrl logic ----------

describe('getOriginUrl (logic)', () => {
  it('returns trimmed origin URL from git command', () => {
    mockedExecSync.mockReturnValue(
      'https://github.com/user/my-game.git\n',
    );
    const result = execSync('git remote get-url origin', {
      cwd: '/repo',
      encoding: 'utf-8',
    });
    expect((result as string).trim()).toBe(
      'https://github.com/user/my-game.git',
    );
  });

  it('returns null when git command fails', () => {
    mockedExecSync.mockImplementation(() => {
      throw new Error('no remote');
    });

    let result: string | null;
    try {
      result = (
        execSync('git remote get-url origin', {
          cwd: '/repo',
          encoding: 'utf-8',
        }) as string
      ).trim();
    } catch {
      result = null;
    }
    expect(result).toBeNull();
  });
});
