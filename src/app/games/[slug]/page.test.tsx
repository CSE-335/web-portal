import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import GamePage from './page';

import { notFound } from 'next/navigation';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
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
    const params = Promise.resolve({ slug: 'matrix-meadow' });
    const Page = await GamePage({ params });

    render(
      <MantineProvider>
        {Page}
      </MantineProvider>
    );

    expect(screen.getByText('Matrix Meadow Academy')).toBeInTheDocument();
  });

  it('calls notFound for an invalid slug', async () => {
    const params = Promise.resolve({ slug: 'nonexistent-game' });

    await GamePage({ params }).catch(() => {});

    expect(notFound).toHaveBeenCalled();
  });
});
