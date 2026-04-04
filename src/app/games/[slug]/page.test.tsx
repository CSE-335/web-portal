import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import GamePage from './page';

jest.mock('@/data/games', () => {
  const game = {
    slug: 'test-game',
    title: 'Test Game',
    subject: 'Science',
    description: 'A test game',
    longDescription: ['Test description paragraph.'],
    iframeSrc: '/games/test-game/index.html',
    thumbnailSrc: '/images/test-game-thumb.png',
    embedHeight: '800px',
    featured: true,
  };
  return {
    games: [game],
    getGameBySlug: (slug: string) => slug === 'test-game' ? game : undefined,
  };
});
import { notFound } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  notFound: jest.fn(),
}));

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({ data: [], error: null }),
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  },
}));

jest.mock('@/features/assistant', () => ({
  GameIframeBridge: () => null,
  useAssistant: () => ({
    state: { isOpen: false },
    dispatch: jest.fn(),
  }),
}));

describe('Game page', () => {
  it('renders a valid game', async () => {
    const params = Promise.resolve({ slug: 'test-game' });
    const Page = await GamePage({ params });

    render(
      <MantineProvider>
        {Page}
      </MantineProvider>
    );

    expect(screen.getByText('Test Game')).toBeInTheDocument();
  });

  it('calls notFound for an invalid slug', async () => {
    const params = Promise.resolve({ slug: 'nonexistent-game' });

    await GamePage({ params }).catch(() => {});

    expect(notFound).toHaveBeenCalled();
  });
});
