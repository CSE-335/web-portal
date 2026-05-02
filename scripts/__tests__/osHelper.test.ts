import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

jest.mock('fs');
jest.mock('child_process');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;

let run: (cmd: string, cwd: string, timeout?: number) => void;
let rmrf: (dir: string) => void;
let mkdirp: (dir: string) => void;
let copyDir: (src: string, dest: string) => void;

beforeAll(async () => {
  const osHelper = await import('../osHelper.mjs');
  run = osHelper.run;
  rmrf = osHelper.rmrf;
  mkdirp = osHelper.mkdirp;
  copyDir = osHelper.copyDir;
});

describe('run', () => {
  it('calls execSync with correct cwd and timeout', () => {
    run('npm ci', '/repo', 30000);
    expect(mockedExecSync).toHaveBeenCalledWith('npm ci', {
      cwd: '/repo',
      stdio: 'inherit',
      timeout: 30000,
    });
  });

  it('passes undefined timeout when not provided', () => {
    run('npm run build', '/repo');
    expect(mockedExecSync).toHaveBeenCalledWith('npm run build', {
      cwd: '/repo',
      stdio: 'inherit',
      timeout: undefined,
    });
  });
});

describe('rmrf', () => {
  it('removes directory when it exists', () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValue(true);
    rmrf('/some/dir');
    expect(mockedFs.rmSync).toHaveBeenCalledWith('/some/dir', {
      recursive: true,
      force: true,
    });
  });

  it('does nothing when directory does not exist', () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValue(false);
    rmrf('/missing/dir');
    expect(mockedFs.rmSync).not.toHaveBeenCalled();
  });
});

describe('mkdirp', () => {
  it('creates directory recursively', () => {
    mkdirp('/nested/dir/path');
    expect(mockedFs.mkdirSync).toHaveBeenCalledWith('/nested/dir/path', {
      recursive: true,
    });
  });
});

describe('copyDir', () => {
  it('recursively copies files and subdirectories', () => {
    // Set up a directory structure: src/ contains a file and a subdirectory
    const fileEntry = { name: 'index.html', isDirectory: () => false };
    const dirEntry = { name: 'assets', isDirectory: () => true };
    const nestedFileEntry = { name: 'style.css', isDirectory: () => false };

    (mockedFs.readdirSync as jest.Mock).mockImplementation((dir: string) => {
      if (dir === '/src') return [fileEntry, dirEntry];
      if (dir === path.join('/src', 'assets')) return [nestedFileEntry];
      return [];
    });

    copyDir('/src', '/dest');

    // Should create dest and dest/assets
    expect(mockedFs.mkdirSync).toHaveBeenCalledWith('/dest', { recursive: true });
    expect(mockedFs.mkdirSync).toHaveBeenCalledWith(
      path.join('/dest', 'assets'),
      { recursive: true },
    );

    // Should copy both files
    expect(mockedFs.copyFileSync).toHaveBeenCalledWith(
      path.join('/src', 'index.html'),
      path.join('/dest', 'index.html'),
    );
    expect(mockedFs.copyFileSync).toHaveBeenCalledWith(
      path.join('/src', 'assets', 'style.css'),
      path.join('/dest', 'assets', 'style.css'),
    );
  });
});
