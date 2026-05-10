import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import HomePage from './page';
import { games } from '@/data/games';

jest.mock('../data/games', () => ({
  games: [
    {
      slug: 'test-game-1',
      title: 'Test Game One',
      subject: 'Science',
      description: 'A test game',
      longDescription: [],
      iframeSrc: '/games/test-game-1/index.html',
      thumbnailSrc: '/images/test-game-1-thumb.png',
      featured: true,
    },
    {
      slug: 'test-game-2',
      title: 'Test Game Two',
      subject: 'Technology',
      description: 'Another test game',
      longDescription: [],
      iframeSrc: '/games/test-game-2/index.html',
      thumbnailSrc: '/images/test-game-2-thumb.png',
      featured: true,
    },
  ],
  getGameBySlug: () => undefined,
}));
jest.mock('next-intl/server', () => ({
  getLocale: () => Promise.resolve('en'),
}));
jest.mock('@/lib/supabase/game-translations', () => ({
  getLocalizedGames: async () => ([
    {
      slug: 'test-game-1',
      title: 'Test Game One',
      subject: 'Science',
      description: 'A test game',
      longDescription: [],
      iframeSrc: '/games/test-game-1/index.html',
      thumbnailSrc: '/images/test-game-1-thumb.png',
      featured: true,
    },
    {
      slug: 'test-game-2',
      title: 'Test Game Two',
      subject: 'Technology',
      description: 'Another test game',
      longDescription: [],
      iframeSrc: '/games/test-game-2/index.html',
      thumbnailSrc: '/images/test-game-2-thumb.png',
      featured: true,
    },
  ]),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  notFound: jest.fn(),
}));

jest.mock('../lib/supabase/server', () => {
  const mockClient = () => ({
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  });
  return {
    createAnonymousSupabaseServerClient: mockClient,
    createServerSupabaseClient: mockClient,
  };
});

async function renderHomePage() {
  const Page = await HomePage();
  render(
    <MantineProvider>
      {Page}
    </MantineProvider>
  );
}

describe('Home page', () => {
  it('renders the welcome banner', async () => {
    await renderHomePage();
    const bannerHeadings = screen.getAllByRole('heading', {
      level: 1,
      name: /Welcome to LLNL STEM Games!/i,
    });
    expect(bannerHeadings.length).toBeGreaterThan(0);
  });

  it('renders a game card for each game', async () => {
    await renderHomePage();
    expect(screen.getByText('Test Game One')).toBeInTheDocument();
    expect(screen.getByText('Test Game Two')).toBeInTheDocument();
  });

  it('renders play links for each game', async () => {
    await renderHomePage();
    const playLinks = screen.getAllByRole('link', { name: 'Play' });
    expect(playLinks).toHaveLength(games.length);
  });

  it('renders the bottom buttons', async () => {
    await renderHomePage();
    // check that the svgs are loaded correctly
    // only checks that the src is set to the correct filename
    expect(
      document.querySelector('img[src="/images/shuffle.svg"]')
    ).toBeInTheDocument();
    expect(
      document.querySelector('img[src="/images/arrow.svg"]')
    ).toBeInTheDocument();

    expect(screen.getByText('Random Game')).toBeInTheDocument();
    expect(screen.getByText('Back to the top')).toBeInTheDocument();
  });
});
