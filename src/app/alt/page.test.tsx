import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import AltHomePage from './page';

jest.mock('@/data/games', () => ({
  games: [
    {
      slug: 'sci-a',
      title: 'Sci A',
      subject: 'Science',
      description: 'd',
      longDescription: [],
      iframeSrc: '/x',
      thumbnailSrc: '/y.png',
    },
    {
      slug: 'tech-a',
      title: 'Tech A',
      subject: 'Technology',
      description: 'd',
      longDescription: [],
      iframeSrc: '/x',
      thumbnailSrc: '/y.png',
    },
    {
      slug: 'eng-a',
      title: 'Eng A',
      subject: 'Engineering',
      description: 'd',
      longDescription: [],
      iframeSrc: '/x',
      thumbnailSrc: '/y.png',
    },
    {
      slug: 'math-a',
      title: 'Math A',
      subject: 'Mathematics',
      description: 'd',
      longDescription: [],
      iframeSrc: '/x',
      thumbnailSrc: '/y.png',
    },
  ],
  getGameBySlug: jest.fn(),
}));

jest.mock('next-intl/server', () => ({
  getLocale: () => Promise.resolve('en'),
}));

jest.mock('@/lib/supabase/game-translations', () => ({
  getLocalizedGames: async () =>
    jest.requireMock<{ games: unknown[] }>('@/data/games').games as never[],
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  notFound: jest.fn(),
}));

async function renderAltHome() {
  const Page = await AltHomePage();
  render(<MantineProvider>{Page}</MantineProvider>);
}

describe('Alt home page', () => {
  it('renders the STEM sections', async () => {
    await renderAltHome();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
  });
});
