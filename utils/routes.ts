interface CalculatePathArgs {
  path?: string;
  url: string;
}

// Environment configuration for routes
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000'

// Set frontpage path for Contentful CMS
export const frontpagePath = '/';

export const calculatePath = ({ path = "/", url }: CalculatePathArgs): string => {
  if (path.startsWith("node/preview")) {
    const { searchParams } = new URL(url);
    if (searchParams.has("token")) {
      return `${path}?token=${searchParams.get("token")}`;
    }
  }

  return path;
}
