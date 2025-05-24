interface CalculatePathArgs {
  path?: string;
  url: string;
}

// Set frontpage path - can be used for both Drupal and Contentful
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
