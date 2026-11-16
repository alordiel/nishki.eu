import type { Block } from 'payload'
import { link } from '../fields/link'

/**
 * One block per section of the designs (HTML/1–6). Every block maps 1:1 to an
 * Astro component in apps/web/src/components/blocks.
 */

const image = (name = 'image', required = true) =>
  ({ name, type: 'upload', relationTo: 'media', required }) as const

/** Full-width photo with an optional heading. When it is the first block the site header overlays it. */
export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    image(),
    {
      name: 'heading',
      type: 'textarea',
      localized: true,
      admin: { description: 'Large heading. Each new line is rendered on its own line.' },
    },
    { name: 'caption', type: 'text', localized: true, admin: { description: 'Small title at the bottom left (e.g. "-мега колаж-").' } },
    {
      type: 'row',
      fields: [
        {
          name: 'height',
          type: 'select',
          defaultValue: 'full',
          options: [
            { label: 'Full screen', value: 'full' },
            { label: 'Medium', value: 'medium' },
          ],
        },
        {
          name: 'align',
          type: 'select',
          defaultValue: 'right',
          options: [
            { label: 'Right', value: 'right' },
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
          ],
        },
      ],
    },
  ],
}

/** "БУТИКОВА СВАТБЕНА ФОТОГРАФИЯ" + subtitle. */
export const Tagline: Block = {
  slug: 'tagline',
  interfaceName: 'TaglineBlock',
  fields: [
    { name: 'heading', type: 'text', localized: true, required: true },
    { name: 'subheading', type: 'textarea', localized: true },
  ],
}

/** Spaced capitals section title, e.g. "ЗА НАС", "ЦЕНИ". */
export const SectionHeading: Block = {
  slug: 'sectionHeading',
  interfaceName: 'SectionHeadingBlock',
  fields: [
    { name: 'text', type: 'text', localized: true, required: true },
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'accent',
      options: [
        { label: 'Accent (brown)', value: 'accent' },
        { label: 'Dark', value: 'dark' },
      ],
    },
  ],
}

/** Home: "НИЕ СМЕ ЙОАНА И МАРИЯ" with two portraits and a link. */
export const Team: Block = {
  slug: 'team',
  interfaceName: 'TeamBlock',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'members',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      fields: [image(), { name: 'name', type: 'text', localized: true }],
    },
    link('link'),
  ],
}

/** Full-width photo strip (home collage, gallery intro banner, prices header). */
export const ImageBanner: Block = {
  slug: 'imageBanner',
  interfaceName: 'ImageBannerBlock',
  fields: [
    image(),
    {
      name: 'height',
      type: 'select',
      defaultValue: 'natural',
      options: [
        { label: 'Natural (whole image)', value: 'natural' },
        { label: 'Small (≈420px)', value: 'small' },
        { label: 'Medium (≈740px)', value: 'medium' },
        { label: 'Large (≈860px)', value: 'large' },
      ],
    },
  ],
}

/** Home: "ЛЮБИМИ ПРОЕКТИ" – hand-picked projects, each linking to its gallery. */
export const FeaturedProjects: Block = {
  slug: 'featuredProjects',
  interfaceName: 'FeaturedProjectsBlock',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'projects', type: 'relationship', relationTo: 'projects', hasMany: true, required: true, maxRows: 8 },
    link('link'),
  ],
}

/** Gallery: alternating photo / text cards, one pair per project, each linking to the project. */
export const ProjectsGrid: Block = {
  slug: 'projectsGrid',
  interfaceName: 'ProjectsGridBlock',
  fields: [
    {
      name: 'source',
      type: 'radio',
      defaultValue: 'all',
      options: [
        { label: 'All published projects (newest first)', value: 'all' },
        { label: 'Hand-picked', value: 'selected' },
      ],
    },
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: { condition: (_, s) => s?.source === 'selected' },
    },
  ],
}

/** Client quote with an optional "read more" link. */
export const Testimonial: Block = {
  slug: 'testimonial',
  interfaceName: 'TestimonialBlock',
  fields: [
    { name: 'quote', type: 'textarea', localized: true, required: true },
    { name: 'author', type: 'text', localized: true },
    link('link'),
  ],
}

/** "ПОСЛЕДВАЙ НИ В INSTAGRAM" banner. Uses the Instagram URL from Site settings. */
export const Instagram: Block = {
  slug: 'instagram',
  interfaceName: 'InstagramBlock',
  fields: [image(), { name: 'heading', type: 'text', localized: true }],
}

/** About: grid of photos and text cards (two columns, any order). */
export const Tiles: Block = {
  slug: 'tiles',
  interfaceName: 'TilesBlock',
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'kind',
          type: 'radio',
          defaultValue: 'image',
          options: [
            { label: 'Photo', value: 'image' },
            { label: 'Text card', value: 'text' },
          ],
        },
        { ...image('image', false), admin: { condition: (_, s) => s?.kind === 'image' } },
        { name: 'eyebrow', type: 'text', localized: true, admin: { condition: (_, s) => s?.kind === 'text' } },
        { name: 'heading', type: 'text', localized: true, admin: { condition: (_, s) => s?.kind === 'text' } },
        { name: 'body', type: 'textarea', localized: true, admin: { condition: (_, s) => s?.kind === 'text' } },
      ],
    },
  ],
}

/** Large serif paragraph (About statement, gallery intro). */
export const Lead: Block = {
  slug: 'lead',
  interfaceName: 'LeadBlock',
  fields: [{ name: 'content', type: 'richText', localized: true, required: true }],
}

/** Regular text with an optional heading and button (Prices). */
export const RichText: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'content', type: 'richText', localized: true },
    link('button'),
  ],
}

/** Prices: "ЧЕСТО ЗАДАВАНИ ВЪПРОСИ". */
export const Faq: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'question', type: 'text', localized: true, required: true },
        { name: 'answer', type: 'richText', localized: true, required: true },
      ],
    },
  ],
}

/** Masonry photo collage (Maley-style): large photos, narrow gaps, mixed orientations. */
export const Collage: Block = {
  slug: 'collage',
  interfaceName: 'CollageBlock',
  fields: [
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      admin: { description: 'Drag to reorder. Photos flow top-to-bottom through the columns.' },
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: ['2', '3', '4', '5'],
      admin: { description: 'Columns on large screens (fewer on phones).' },
    },
  ],
}

/** Contact form (fields are fixed by the API contract; only texts are editable). */
export const ContactForm: Block = {
  slug: 'contactForm',
  interfaceName: 'ContactFormBlock',
  fields: [
    { name: 'intro', type: 'textarea', localized: true },
    { name: 'successHeading', type: 'text', localized: true },
    { name: 'successText', type: 'textarea', localized: true },
  ],
}

/** A single centered button. */
export const Cta: Block = {
  slug: 'cta',
  interfaceName: 'CtaBlock',
  labels: { singular: 'Button', plural: 'Buttons' },
  fields: [
    link('link', { required: true }),
    {
      name: 'style',
      type: 'select',
      defaultValue: 'solid',
      options: [
        { label: 'Solid', value: 'solid' },
        { label: 'Outline', value: 'outline' },
        { label: 'Underlined text', value: 'text' },
      ],
    },
  ],
}

export const pageBlocks: Block[] = [
  Hero,
  Tagline,
  SectionHeading,
  Team,
  ImageBanner,
  FeaturedProjects,
  ProjectsGrid,
  Testimonial,
  Instagram,
  Tiles,
  Lead,
  RichText,
  Faq,
  Collage,
  ContactForm,
  Cta,
]

/** Blocks available inside a project gallery: photos and free text, in any order and amount. */
export const projectBlocks: Block[] = [Collage, Lead, RichText, ImageBanner]
