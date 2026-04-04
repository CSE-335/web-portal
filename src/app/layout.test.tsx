import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import RootLayout, { metadata } from './layout';

jest.mock('@/components/layout/Header/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('@/components/layout/Footer/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

describe('RootLayout', () => {
  function extractBody(layout: ReactNode): ReactElement {
    if (!isValidElement<{ children?: ReactNode }>(layout)) {
      throw new Error('RootLayout did not return a valid React element');
    }

    const children = Array.isArray(layout.props.children)
      ? layout.props.children
      : [layout.props.children];

    const body = children.find(
      (child) => isValidElement(child) && child.type === 'body'
    );

    if (!isValidElement(body)) {
      throw new Error('RootLayout output did not contain a <body> element');
    }

    return body as ReactElement;
  }

  async function renderLayout() {
    const layout = await RootLayout({
      children: <p>Page content</p>,
    });

    render(extractBody(layout));
  }

  it('renders the header', async () => {
    await renderLayout();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders the footer', async () => {
    await renderLayout();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders children content', async () => {
    await renderLayout();
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('has the correct metadata', () => {
    expect(metadata.title).toBe('LLNL STEM Games');
    expect(metadata.description).toBe('Educational STEM games from Lawrence Livermore National Laboratory');
  });
});
