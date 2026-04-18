import { execSync } from 'child_process';
import fs from 'fs';

jest.mock('fs');
jest.mock('child_process');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;

// Dynamic import so jest.mock() hoisting takes effect first
let getGitCommit: (repoDir: string) => string | null;
let readJson: (filePath: string) => unknown;
let loadCache: (cacheFile: string) => Record<string, string>;
let saveCache: (cacheFile: string, cache: Record<string, string>) => void;

beforeAll(async () => {
  const utils = await import('../utils.mjs');
  getGitCommit = utils.getGitCommit;
  readJson = utils.readJson;
  loadCache = utils.loadCache;
  saveCache = utils.saveCache;
});

describe('getGitCommit', () => {
  it('returns trimmed commit hash', () => {
    mockedExecSync.mockReturnValue('abc123def456\n');
    expect(getGitCommit('/some/repo')).toBe('abc123def456');
    expect(mockedExecSync).toHaveBeenCalledWith('git rev-parse HEAD', {
      cwd: '/some/repo',
      encoding: 'utf-8',
    });
  });

  it('returns null when git command fails', () => {
    mockedExecSync.mockImplementation(() => {
      throw new Error('not a git repo');
    });
    expect(getGitCommit('/bad/path')).toBeNull();
  });
});

describe('readJson', () => {
  it('parses and returns JSON from file', () => {
    const data = { name: 'test', version: '1.0' };
    (mockedFs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(data));
    expect(readJson('/path/to/file.json')).toEqual(data);
    expect(mockedFs.readFileSync).toHaveBeenCalledWith('/path/to/file.json', 'utf-8');
  });

  it('throws on invalid JSON', () => {
    (mockedFs.readFileSync as jest.Mock).mockReturnValue('not json');
    expect(() => readJson('/path/to/bad.json')).toThrow();
  });
});

describe('loadCache', () => {
  it('returns parsed cache object', () => {
    const cache = { 'game-a': 'commit1', 'game-b': 'commit2' };
    (mockedFs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(cache));
    expect(loadCache('/cache.json')).toEqual(cache);
  });

  it('returns empty object when file does not exist', () => {
    (mockedFs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('ENOENT');
    });
    expect(loadCache('/missing.json')).toEqual({});
  });
});

describe('saveCache', () => {
  it('writes formatted JSON to file', () => {
    const cache = { 'game-a': 'commit1' };
    saveCache('/cache.json', cache);
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      '/cache.json',
      JSON.stringify(cache, null, 2),
    );
  });
});
