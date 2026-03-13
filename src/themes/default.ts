import { createTheme, colorsTuple } from '@mantine/core';

export const defaultTheme = createTheme({
  colors: {
    dark: colorsTuple('#ffffff'),
  },
  fontFamily: 'Geist, sans-serif',
  fontFamilyMonospace: 'Geist Mono, monospace',
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
        c: 'white',
        fw: 800,
        lh: 1,
      },
    },
  },
});
