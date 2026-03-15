import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout from './layout';

jest.mock('../components/layout/Header/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../components/layout/Footer/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

describe('RootLayout', () => {
  it('renders the header', () => {
    render(
      <RootLayout>
        <p>Page content</p>
      </RootLayout>,
      { container: document }
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders the footer', () => {
    render(
      <RootLayout>
        <p>Page content</p>
      </RootLayout>,
      { container: document }
    );
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <RootLayout>
        <p>Page content</p>
      </RootLayout>,
      { container: document }
    );
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('has the correct metadata', () => {
    const { metadata } = require('./layout');
    expect(metadata.title).toBe('LLNL STEM Games');
    expect(metadata.description).toBe('Educational STEM games from Lawrence Livermore National Laboratory');
  });
});
