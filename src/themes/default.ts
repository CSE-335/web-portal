import { createTheme } from '@mantine/core';

export const defaultTheme = createTheme({
  fontFamily: 'var(--font-alexandria), Alexandria, sans-serif',
  fontFamilyMonospace: 'monospace',
  components: {
    Button: {
      defaultProps: {
        radius: 'xl',
        fw: 700,
      },
    },
    Container: {
      defaultProps: {
        size: 1180,
        py: 'lg',
        px: { base: 'md', md: 'lg' },
      },
    },
    Title: {
      defaultProps: {
        c: 'var(--text-primary)',
        fw: 800,
        lh: 1,
      },
    },
  },
});
