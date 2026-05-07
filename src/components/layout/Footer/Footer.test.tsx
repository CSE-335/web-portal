import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import Footer from './Footer';

function renderFooter() {
  return render(
    <MantineProvider>
      <Footer />
    </MantineProvider>
  );
}

describe('Footer', () => {
  it('renders the logo', () => {
    renderFooter();
    expect(screen.getByAltText('LLNL STEM Games Logo')).toBeInTheDocument();
  });

  it('renders all navigation links with correct hrefs', () => {
    renderFooter();
    const expectedLinks = [
      { name: 'ALL GAMES', href: '/' },
      { name: 'ABOUT US', href: '/about' },
      { name: 'CONTACT US', href: '/contact' },
      { name: 'PRIVACY', href: '/privacy' },
      { name: 'FEEDBACK', href: '/feedback' },
    ];

    expectedLinks.forEach(({ name, href }) => {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('renders the description text', () => {
    renderFooter();
    expect(screen.getByText(/Welcome to Lawrence Livermore National Laboratory/)).toBeInTheDocument();
  });
});
