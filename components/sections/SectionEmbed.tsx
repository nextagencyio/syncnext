import { EmbedEntry } from '@/lib/contentful-types';
import Embed from '@/components/embed/Embed';

export interface EmbedSection {
  type: 'embed';
  title?: string;
  script: string;
}

interface SectionEmbedProps {
  section: EmbedEntry | EmbedSection;
  modifier?: string;
}

export default function SectionEmbed({ section, modifier }: SectionEmbedProps) {
  // Handle both Contentful Entry and EmbedSection interfaces
  let title: string | undefined;
  let script: string;

  if ('fields' in section) {
    // Contentful Entry format
    const { title: entryTitle, script: entryScript } = section.fields;
    title = entryTitle;
    script = entryScript;
  } else {
    // EmbedSection format
    title = section.title;
    script = section.script;
  }

  // Use the script directly as content, ensure it's a string
  const content = script || '';

  return (
    <Embed
      title={title}
      content={content}
      modifier={modifier}
    />
  );
}
