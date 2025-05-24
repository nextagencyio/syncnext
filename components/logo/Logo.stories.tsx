import type { Meta, StoryObj } from '@storybook/react';
import Logo from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'General/Logo',
  component: Logo,
  argTypes: {
    modifier: {
      description: 'Additional CSS classes',
      control: 'text',
    },
    textColor: {
      description: 'Text color class',
      control: 'select',
      options: ['text-foreground', 'text-white', 'text-muted-foreground', 'text-primary'],
    },
    size: {
      description: 'Logo size',
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  args: {
    size: 'md',
    textColor: 'text-foreground',
  }
};

export const Large: Story = {
  args: {
    size: 'lg',
    textColor: 'text-foreground',
  }
};

export const Small: Story = {
  args: {
    size: 'sm',
    textColor: 'text-foreground',
  }
};

export const OnDark: Story = {
  args: {
    size: 'md',
    textColor: 'text-white',
  },
  decorators: [
    (Story) => (
      <div className="bg-background dark p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export const InHeader: Story = {
  args: {
    size: 'md',
    textColor: 'text-foreground',
    modifier: 'navbar-brand',
  },
  decorators: [
    (Story) => (
      <div className="bg-background border-b p-4 shadow-sm">
        <Story />
      </div>
    ),
  ],
};
