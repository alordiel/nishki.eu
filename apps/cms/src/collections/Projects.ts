import type { CollectionConfig } from 'payload'
import { projectBlocks } from '../blocks'
import { seo, slug } from '../fields/link'
import { isContentReader, isEditor } from '../lib/access'

/** A wedding / session. Shown in "Любими проекти" and the gallery; each has its own gallery page. */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'venue', 'date', '_status'],
    group: 'Content',
  },
  access: { read: isContentReader, create: isEditor, update: isEditor, delete: isEditor },
  defaultSort: '-date',
  versions: { drafts: true, maxPerDoc: 20 },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true, admin: { description: 'Names, e.g. "Мария & Иван"' } },
    slug,
    {
      type: 'row',
      fields: [
        { name: 'venue', type: 'text', localized: true },
        { name: 'location', type: 'text', localized: true },
        { name: 'season', type: 'text', localized: true },
      ],
    },
    { name: 'date', type: 'date', admin: { position: 'sidebar', description: 'Used for ordering' } },
    { name: 'cover', type: 'upload', relationTo: 'media', required: true },
    { name: 'excerpt', type: 'textarea', localized: true, admin: { description: '2–3 sentences shown on the gallery page and at the top of the project.' } },
    {
      name: 'layout',
      label: 'Gallery',
      type: 'blocks',
      blocks: projectBlocks,
      admin: { description: 'Mix photo collages and text in any order — e.g. collage, text, collage.' },
    },
    seo,
  ],
}
