import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import HomePage from './page';

jest.mock('../lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  }),
}));

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
    expect(screen.getByText(/Welcome to LLNL/)).toBeInTheDocument();
    expect(screen.getByText(/STEM Games/)).toBeInTheDocument();
  });

  it('renders a game card for each game', async () => {
    await renderHomePage();
    expect(screen.getByText('Matrix Meadow Academy')).toBeInTheDocument();
    expect(screen.getByText('Sonic Fingerprint Lab')).toBeInTheDocument();
  });

  it('renders play links for each game', async () => {
    await renderHomePage();
    const playLinks = screen.getAllByRole('link', { name: 'Play' });
    expect(playLinks).toHaveLength(2);
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
