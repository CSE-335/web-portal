import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: [
    "../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [],
  framework: "@storybook/nextjs-vite",
  staticDirs: [
    "../public"
  ],
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.dedupe = ['react', 'react-dom'];
    return config;
  },
};
export default config;
