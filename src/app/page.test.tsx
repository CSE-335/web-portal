import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import HomePage from './page';

describe('Home page', () => {
  it('renders the welcome banner', () => {
    render(
      <MantineProvider>
        <HomePage />
      </MantineProvider>
    );
    expect(screen.getByText(/Welcome to LLNL/)).toBeInTheDocument();
    expect(screen.getByText(/STEM Games/)).toBeInTheDocument();
  });

  it('renders a game card for each game', () => {
    render(
      <MantineProvider>
        <HomePage />
      </MantineProvider>
    );
    expect(screen.getByText('Matrix Meadow Academy')).toBeInTheDocument();
    expect(screen.getByText('Sonic Fingerprint Lab')).toBeInTheDocument();
  });

  it('renders play links for each game', () => {
    render(
      <MantineProvider>
        <HomePage />
      </MantineProvider>
    );
    const playLinks = screen.getAllByRole('link', { name: 'Play' });
    expect(playLinks).toHaveLength(2);
  });

  it('renders the bottom buttons', () => {
    render(
      <MantineProvider>
        <HomePage />
      </MantineProvider>
    );
    expect(screen.getByText('Random Game')).toBeInTheDocument();
    expect(screen.getByText('↑ Back to the top')).toBeInTheDocument();
  });
});
