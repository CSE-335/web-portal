import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import Header from './Header';

function renderHeader() {
  return render(
    <MantineProvider>
      <Header />
    </MantineProvider>
  );
}

describe('Header', () => {
  it('renders the logo link to home', () => {
    renderHeader();
    const homeLink = screen.getByRole('link', { name: /LLNL STEM/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders the search bar', () => {
    renderHeader();
    expect(screen.getByPlaceholderText('Search STEM games...')).toBeInTheDocument();
  });

  it('updates search bar value when typing', async () => {
    renderHeader();
    const searchInput = screen.getByPlaceholderText('Search STEM games...');
    await userEvent.type(searchInput, 'matrix');
    expect(searchInput).toHaveValue('matrix');
  });

  it('renders the favorites button', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: 'Favorites' })).toBeInTheDocument();
  });

  it('renders the login link', () => {
    renderHeader();
    const loginLink = screen.getByRole('link', { name: 'Log in' });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
