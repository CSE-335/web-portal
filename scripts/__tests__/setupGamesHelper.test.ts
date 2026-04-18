import fs from 'fs';

jest.mock('fs');
jest.mock('../osHelper.mjs', () => ({
  run: jest.fn(),
  rmrf: jest.fn(),
  copyDir: jest.fn(),
}));

const mockedFs = fs as jest.Mocked<typeof fs>;

let canSkipGame: (
  forceRebuild: boolean,
  commit: string | null,
  cached: string | undefined,
  outputDir: string,
) => boolean;
let buildAndCopy: (
  label: string,
  gameDir: string,
  gameId: string,
  outputDir: string,
  thumbsDir: string,
) => void;
let run: jest.Mock;
let rmrf: jest.Mock;
let copyDir: jest.Mock;

beforeAll(async () => {
  const helper = await import('../setupGamesHelper.mjs');
  canSkipGame = helper.canSkipGame;
  buildAndCopy = helper.buildAndCopy;

  const osHelper = await import('../osHelper.mjs');
  run = osHelper.run as jest.Mock;
  rmrf = osHelper.rmrf as jest.Mock;
  copyDir = osHelper.copyDir as jest.Mock;
});

describe('canSkipGame', () => {
  it('returns true when all conditions are met', () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValue(true);
    expect(canSkipGame(false, 'abc123', 'abc123', '/output')).toBe(true);
  });

  it('returns false when forceRebuild is true', () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValue(true);
    expect(canSkipGame(true, 'abc123', 'abc123', '/output')).toBe(false);
  });

  it('returns false when commit is null', () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValue(true);
    expect(canSkipGame(false, null, 'abc123', '/output')).toBeFalsy();
  });

  it('returns false when cached commit does not match', () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValue(true);
    expect(canSkipGame(false, 'abc123', 'def456', '/output')).toBe(false);
  });

  it('returns false when cached is undefined', () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValue(true);
    expect(canSkipGame(false, 'abc123', undefined, '/output')).toBe(false);
  });

  it('returns false when output directory does not exist', () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValue(false);
    expect(canSkipGame(false, 'abc123', 'abc123', '/output')).toBe(false);
  });
});

describe('buildAndCopy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs npm ci and npm run build in the game directory', () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValue(false);

    buildAndCopy('TestGame', '/repo', 'test-game', '/output', '/thumbs');

    expect(run).toHaveBeenCalledWith('npm ci', '/repo');
    expect(run).toHaveBeenCalledWith('npm run build', '/repo');
  });

  it('copies dist/ to output directory when it exists', () => {
    (mockedFs.existsSync as jest.Mock).mockImplementation((p: string) => {
      if (p.endsWith('dist')) return true;
      if (p.endsWith('thumbnail.png')) return false;
      return false;
    });

    buildAndCopy('TestGame', '/repo', 'test-game', '/output', '/thumbs');

    expect(rmrf).toHaveBeenCalledWith('/output');
    expect(copyDir).toHaveBeenCalledWith(
      expect.stringContaining('dist'),
      '/output',
    );
  });

  it('does not copy dist/ when it does not exist', () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValue(false);

    buildAndCopy('TestGame', '/repo', 'test-game', '/output', '/thumbs');

    expect(rmrf).not.toHaveBeenCalled();
    expect(copyDir).not.toHaveBeenCalled();
  });

  it('copies thumbnail when present', () => {
    (mockedFs.existsSync as jest.Mock).mockImplementation((p: string) => {
      if (p.endsWith('dist')) return false;
      if (p.endsWith('thumbnail.png')) return true;
      return false;
    });

    buildAndCopy('TestGame', '/repo', 'test-game', '/output', '/thumbs');

    expect(mockedFs.copyFileSync).toHaveBeenCalledWith(
      expect.stringContaining('thumbnail.png'),
      expect.stringContaining('test-game.png'),
    );
  });

  it('skips thumbnail when not present', () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValue(false);

    buildAndCopy('TestGame', '/repo', 'test-game', '/output', '/thumbs');

    expect(mockedFs.copyFileSync).not.toHaveBeenCalled();
  });
});
