import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import AltHomePage from './page';

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