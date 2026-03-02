import type { StorybookConfig } from '@storybook/nextjs-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
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