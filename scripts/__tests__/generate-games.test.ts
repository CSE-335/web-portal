import fs from 'fs';

jest.mock('fs');
jest.mock('../gameSources.mjs', () => ({
  ROOT_DIR: '/project',
  getConfiguredGameEntries: jest.fn(),
}));
jest.mock('../utils.mjs', () => ({
  readJson: jest.fn(),
}));

const mockedFs = fs as jest.Mocked<typeof fs>;

let generateGamesData: () => void;
let getConfiguredGameEntries: jest.Mock;
let readJson: jest.Mock;

beforeAll(async () => {
  const gen = await import('../generate-games.mjs');
  generateGamesData = gen.generateGamesData;

  const gameSources = await import('../gameSources.mjs');
  getConfiguredGameEntries = gameSources.getConfiguredGameEntries as jest.Mock;

  const utils = await import('../utils.mjs');
  readJson = utils.readJson as jest.Mock;
});

function setupEntries(
  entries: Array<{ repoName: string; repoDir: string }>,
) {
  getConfiguredGameEntries.mockReturnValue(entries);
}

function setupFs(existingPaths: string[]) {
  (mockedFs.existsSync as jest.Mock).mockImplementation((p: string) =>
    existingPaths.some((ep) => p.endsWith(ep) || p === ep),
  );
  (mockedFs.mkdirSync as jest.Mock).mockReturnValue(undefined);
  (mockedFs.writeFileSync as jest.Mock).mockReturnValue(undefined);
}

describe('generateGamesData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates TypeScript file with valid game entries', () => {
    setupEntries([
      { repoName: 'test-game', repoDir: '/repos/test-game' },
    ]);
    setupFs(['/repos/test-game', 'game.json']);
    readJson.mockReturnValue({
      'game-id': 'test-game',
      title: 'Test Game',
      subject: 'Science',
      description: 'A test game',
    });

    generateGamesData();

    expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
    const writtenContent = (mockedFs.writeFileSync as jest.Mock).mock.calls[0][1] as string;
    expect(writtenContent).toContain('export const games: GameMeta[]');
    expect(writtenContent).toContain('"test-game"');
    expect(writtenContent).toContain('"Test Game"');
    expect(writtenContent).toContain('"Science"');
  });

  it('uses default values for optional fields', () => {
    setupEntries([
      { repoName: 'minimal-game', repoDir: '/repos/minimal-game' },
    ]);
    setupFs(['/repos/minimal-game', 'game.json']);
    readJson.mockReturnValue({
      'game-id': 'minimal-game',
    });

    generateGamesData();

    const writtenContent = (mockedFs.writeFileSync as jest.Mock).mock.calls[0][1] as string;
    // Title defaults to game-id
    expect(writtenContent).toContain('"minimal-game"');
    // Subject defaults to Technology
    expect(writtenContent).toContain('"Technology"');
    // Description defaults to empty string
    expect(writtenContent).toContain('"description": ""');
  });

  it('skips games with missing game-id', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    setupEntries([
      { repoName: 'bad-game', repoDir: '/repos/bad-game' },
    ]);
    setupFs(['/repos/bad-game', 'game.json']);
    readJson.mockReturnValue({ title: 'No ID Game' });

    // Should still throw because no valid games means missing repos check doesn't fire,
    // but the game is skipped. With 0 valid games and 0 missing repos, it writes empty.
    generateGamesData();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('missing "game-id"'),
    );
    const writtenContent = (mockedFs.writeFileSync as jest.Mock).mock.calls[0][1] as string;
    expect(writtenContent).toContain('[]');
    warnSpy.mockRestore();
  });

  it('skips games with invalid subject', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    setupEntries([
      { repoName: 'bad-subject', repoDir: '/repos/bad-subject' },
    ]);
    setupFs(['/repos/bad-subject', 'game.json']);
    readJson.mockReturnValue({
      'game-id': 'bad-subject',
      subject: 'Art',
    });

    generateGamesData();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('invalid subject'),
    );
    warnSpy.mockRestore();
  });

  it('throws when cached repos are missing', () => {
    setupEntries([
      { repoName: 'missing-repo', repoDir: '/repos/missing-repo' },
    ]);
    // Repo dir does not exist
    (mockedFs.existsSync as jest.Mock).mockReturnValue(false);

    expect(() => generateGamesData()).toThrow('Missing cached game repos');
  });

  it('skips games with missing game.json', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    setupEntries([
      { repoName: 'no-meta', repoDir: '/repos/no-meta' },
    ]);
    // Repo dir exists, but game.json does not
    (mockedFs.existsSync as jest.Mock).mockImplementation((p: string) => {
      if (p === '/repos/no-meta') return true;
      return false; // game.json doesn't exist
    });

    generateGamesData();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('no data/game.json'),
    );
    warnSpy.mockRestore();
  });

  it('includes assistantTutorBrief when provided', () => {
    setupEntries([
      { repoName: 'tutor-game', repoDir: '/repos/tutor-game' },
    ]);
    setupFs(['/repos/tutor-game', 'game.json']);
    readJson.mockReturnValue({
      'game-id': 'tutor-game',
      subject: 'Mathematics',
      'assistant-tutor-brief': 'Help students learn algebra',
      'assistant-target-concept': 'Linear equations',
    });

    generateGamesData();

    const writtenContent = (mockedFs.writeFileSync as jest.Mock).mock.calls[0][1] as string;
    expect(writtenContent).toContain('Help students learn algebra');
    expect(writtenContent).toContain('Linear equations');
  });

  it('includes assistantDialogueConstraints when assistant-dialogue-constraints is provided', () => {
    setupEntries([
      { repoName: 'constraints-game', repoDir: '/repos/constraints-game' },
    ]);
    setupFs(['/repos/constraints-game', 'game.json']);
    readJson.mockReturnValue({
      'game-id': 'constraints-game',
      subject: 'Science',
      'assistant-dialogue-constraints': '- Focus on lab procedure only.',
    });

    generateGamesData();

    const writtenContent = (mockedFs.writeFileSync as jest.Mock).mock.calls[0][1] as string;
    expect(writtenContent).toContain('Focus on lab procedure only.');
    expect(writtenContent).toContain('assistantDialogueConstraints');
  });

  it('includes assistantMistakeGuide when assistant-mistake-guide is provided', () => {
    setupEntries([
      { repoName: 'mistake-game', repoDir: '/repos/mistake-game' },
    ]);
    setupFs(['/repos/mistake-game', 'game.json']);
    readJson.mockReturnValue({
      'game-id': 'mistake-game',
      subject: 'Science',
      'assistant-mistake-guide': 'Players often confuse R0 with mortality rate.',
    });

    generateGamesData();

    const writtenContent = (mockedFs.writeFileSync as jest.Mock).mock.calls[0][1] as string;
    expect(writtenContent).toContain('Players often confuse R0 with mortality rate.');
    expect(writtenContent).toContain('assistantMistakeGuide');
  });
});
