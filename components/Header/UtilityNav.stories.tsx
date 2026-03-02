import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import UtilityNav from './UtilityNav';

const meta: Meta<typeof UtilityNav> = {
  title: 'Components/UtilityNav',
  component: UtilityNav,
};

export default meta;
type Story = StoryObj<typeof UtilityNav>;

export const Default: Story = {};
