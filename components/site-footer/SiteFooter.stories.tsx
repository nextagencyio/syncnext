import type { Meta, StoryObj } from '@storybook/react';
import SiteFooter from './SiteFooter';

const meta: Meta<typeof SiteFooter> = {
  title: 'General/Site Footer',
  component: SiteFooter,
  argTypes: {
    links: {
      description: 'Define the links',
      control: 'object',
    },
    showLogo: {
      description: 'Show the SyncNext logo',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SiteFooter>;

export const Default: Story = {
  args: {
    showLogo: true,
    siteName: 'SyncNext',
    links: [
      {
        title: 'Privacy Policy',
        url: '#',
      },
      {
        title: 'Terms of Use',
        url: '#',
      },
      {
        title: 'Contact Us',
        url: '#',
      },
    ],
  },
};
