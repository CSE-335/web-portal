import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import Home from '../app/page';

describe('Home page', () => {
  it('renders the title', () => {
    render(
      <MantineProvider>
        <Home />
      </MantineProvider>
    );
    expect(screen.getByText('CSE 335')).toBeInTheDocument();
  });

  it('renders the get started button', () => {
    render(
      <MantineProvider>
        <Home />
      </MantineProvider>
    );
    expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
  });
});
