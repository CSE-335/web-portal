import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import AltHomePage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  notFound: jest.fn(),
}));

describe('Alt home page', () => {
  it('renders the STEM sections', () => {
    render(
      <MantineProvider>
        <AltHomePage />
      </MantineProvider>
    );
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });
});