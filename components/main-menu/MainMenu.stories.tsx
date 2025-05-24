import type { Meta, StoryObj } from '@storybook/react';
import MainMenu from './MainMenu';

const meta: Meta<typeof MainMenu> = {
  title: 'General/Main Menu',
  component: MainMenu,
  argTypes: {
    modifier: {
      description: 'Define the modifier',
      control: 'text',
    },
    linkModifier: {
      description: 'Define the link modifier',
      control: 'text',
    },
    showLogo: {
      description: 'Show the SyncNext logo',
      control: 'boolean',
    },
    showSiteName: {
      description: 'Show the site name',
      control: 'boolean',
    },
    siteName: {
      description: 'Define the site name',
      control: 'text',
    },
    menuItems: {
      description: 'Define the menu items',
      control: 'object',
    },
    ctaLinkCount: {
      description: 'Number of CTA links',
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MainMenu>;

const sampleMenuItems = [
  { title: 'Home', url: '/' },
  { title: 'About', url: '/about' },
  {
    title: 'Services',
    url: '/services',
    below: [
      { title: 'Web Development', url: '/services/web-development' },
      { title: 'Consulting', url: '/services/consulting' },
    ]
  },
  { title: 'Contact', url: '/contact' },
  { title: 'Get Started', url: '/get-started' },
];

export const Default: Story = {
  args: {
    modifier: 'bg-white shadow-sm',
    linkModifier: 'text-foreground hover:text-primary',
    showLogo: true,
    showSiteName: false,
    siteName: 'SyncNext',
    menuItems: sampleMenuItems,
    ctaLinkCount: 1,
  }
};

export const WithSiteName: Story = {
  args: {
    modifier: 'bg-white shadow-sm',
    linkModifier: 'text-foreground hover:text-primary',
    showLogo: false,
    showSiteName: true,
    siteName: 'SyncNext',
    menuItems: sampleMenuItems,
    ctaLinkCount: 1,
  }
};
