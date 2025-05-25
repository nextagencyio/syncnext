import { Entry } from 'contentful';
import Embed from '@/components/embed/Embed';

export interface EmbedSection {
  type: 'embed';
  title?: string;
  script: string;
}

interface SectionEmbedProps {
  section: Entry<any> | EmbedSection;
  modifier?: string;
}

export default function SectionEmbed({ section, modifier }: SectionEmbedProps) {
  // Handle both Contentful Entry and EmbedSection interfaces
  let title: string | undefined;
  let script: string;

  if ('fields' in section) {
    // Contentful Entry format
    const fields = section.fields;
    title = fields.title as string;
    script = fields.script as string;
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
