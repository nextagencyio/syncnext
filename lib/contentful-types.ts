import { Entry, Asset } from 'contentful'

// Base Contentful types
export interface ContentfulImage extends Asset {
  fields: {
    title: string
    description: string
    file: {
      url: string
      details: {
        size: number
        image: {
          width: number
          height: number
        }
      }
      fileName: string
      contentType: string
    }
  }
}

// Rich text content type
export interface RichTextContent {
  nodeType: string
  content: any[]
}

// Practical approach: Define field interfaces separately
export interface ArticleFields {
  title: string
  slug: string
  subhead?: string
  lead?: RichTextContent
  media?: ContentfulImage
  body?: RichTextContent
  tags?: string[]
  publishedDate?: string
}

export interface LandingPageFields {
  title: string
  slug: string
  sections?: SectionEntry[]
}

export interface PageFields {
  title: string
  slug: string
  mediaPage?: ContentfulImage
  body?: RichTextContent
}

// Practical type aliases that work with Contentful's runtime behavior
export type ArticleEntry = Entry<any> & { fields: ArticleFields }
export type LandingPageEntry = Entry<any> & { fields: LandingPageFields }
export type PageEntry = Entry<any> & { fields: PageFields }

// Section entry types
export type HeroEntry = Entry<any> & { fields: HeroFields }
export type TextEntry = Entry<any> & { fields: TextFields }
export type CardEntry = Entry<any> & { fields: CardFields }
export type EmbedEntry = Entry<any> & { fields: EmbedFields }
export type NewsletterEntry = Entry<any> & { fields: NewsletterFields }
export type GalleryEntry = Entry<any> & { fields: GalleryFields }
export type MediaEntry = Entry<any> & { fields: MediaFields }
export type QuoteEntry = Entry<any> & { fields: QuoteFields }
export type AccordionItemEntry = Entry<any> & { fields: AccordionItemFields }
export type AccordionEntry = Entry<any> & { fields: AccordionFields }
export type CardGroupEntry = Entry<any> & { fields: CardGroupFields }
export type SideBySideEntry = Entry<any> & { fields: SideBySideFields }
export type LogoCollectionEntry = Entry<any> & { fields: LogoCollectionFields }
export type CarouselItemEntry = Entry<any> & { fields: CarouselItemFields }
export type CarouselEntry = Entry<any> & { fields: CarouselFields }
export type PricingCardEntry = Entry<any> & { fields: PricingCardFields }
export type PricingEntry = Entry<any> & { fields: PricingFields }
export type StatsItemEntry = Entry<any> & { fields: StatsItemFields }
export type BulletEntry = Entry<any> & { fields: BulletFields }
export type RecentArticlesEntry = Entry<any> & { fields: RecentArticlesFields }
export type MenuItemEntry = Entry<any> & { fields: MenuItemFields }
export type MenuEntry = Entry<any> & { fields: MenuFields }

// Union type for all section entries
export type SectionEntry =
  | HeroEntry
  | TextEntry
  | CardEntry
  | EmbedEntry
  | NewsletterEntry
  | GalleryEntry
  | MediaEntry
  | QuoteEntry
  | AccordionEntry
  | CardGroupEntry
  | SideBySideEntry
  | LogoCollectionEntry
  | CarouselEntry
  | PricingEntry
  | RecentArticlesEntry

// Section field interfaces
export interface HeroFields {
  title?: string
  heroLayout?: 'image_top' | 'image_bottom' | 'image_bottom_split'
  linkTitle?: string
  linkUrl?: string
  link2Title?: string
  link2Url?: string
  media?: ContentfulImage
  summary?: RichTextContent
}

export interface TextFields {
  title?: string
  body?: RichTextContent
  textLayout?: 'default' | 'centered' | 'buttons-right'
  eyebrow?: string
  linkTitle?: string
  linkUrl?: string
  link2Title?: string
  link2Url?: string
}

export interface CardFields {
  title?: string
  summary?: string
  linkTitle?: string
  linkUrl?: string
  media?: ContentfulImage
  tags?: string[]
}

export interface EmbedFields {
  title?: string
  script: string
  caption?: string
  maxWidth?: string
}

export interface NewsletterFields {
  newsletterTitle: string
  summary?: RichTextContent
}

export interface GalleryFields {
  title?: string
  gallerySummary?: RichTextContent
  mediaItem?: ContentfulImage[]
}

export interface MediaFields {
  title?: string
  media?: ContentfulImage
}

export interface QuoteFields {
  author?: string
  jobTitle?: string
  logo?: ContentfulImage
  quote?: string
  thumb?: ContentfulImage
}

export interface AccordionItemFields {
  title: string
  body?: RichTextContent
  linkTitle?: string
  linkUrl?: string
}

export interface AccordionFields {
  title?: string
  accordionItem?: AccordionItemEntry[]
}

export interface CardGroupFields {
  title?: string
  summary?: RichTextContent
  cards?: (CardEntry | StatsItemEntry)[]
}

export interface SideBySideFields {
  eyebrow?: string
  title?: string
  summary?: RichTextContent
  linkTitle?: string
  linkUrl?: string
  media?: ContentfulImage
  features?: (StatsItemEntry | BulletEntry)[]
  layout?: string
}

export interface LogoCollectionFields {
  title?: string
  logos?: ContentfulImage[]
}

export interface CarouselItemFields {
  title?: string
  summary?: string
  media?: ContentfulImage
}

export interface CarouselFields {
  title?: string
  carouselItem?: CarouselItemEntry[]
}

export interface PricingCardFields {
  title?: string
  eyebrow?: string
  featuresText?: string
  linkTitle?: string
  linkUrl?: string
  suffix?: string
}

export interface PricingFields {
  eyebrow?: string
  pricingTitle?: string
  pricingSummary?: RichTextContent
  pricingCards?: PricingCardEntry[]
}

export interface StatsItemFields {
  heading: string
  body?: string
  icon?: string
  media?: ContentfulImage
}

export interface BulletFields {
  icon: string
  summary: string
}

export interface RecentArticlesFields {
  title?: string
}

export interface MenuItemFields {
  title: string
  url: string
  order?: number
  children?: MenuItemEntry[]
}

export interface MenuFields {
  name: string
  identifier: string
  items: MenuItemEntry[]
}

// Type guards for runtime type checking
export function isArticleEntry(entry: Entry<any>): entry is ArticleEntry {
  return entry.sys.contentType.sys.id === 'article'
}

export function isLandingPageEntry(entry: Entry<any>): entry is LandingPageEntry {
  return entry.sys.contentType.sys.id === 'landing'
}

export function isPageEntry(entry: Entry<any>): entry is PageEntry {
  return entry.sys.contentType.sys.id === 'page'
}

// Helper type for content type identification
export type ContentTypeId =
  | 'article'
  | 'landing'
  | 'page'
  | 'hero'
  | 'text'
  | 'card'
  | 'embed'
  | 'newsletter'
