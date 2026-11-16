import type { CollectionConfig } from 'payload'
import { pageBlocks } from '../blocks'
import { seo, slug } from '../fields/link'
import { isContentReader, isEditor } from '../lib/access'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
  },
  access: { read: isContentReader, create: isEditor, update: isEditor, delete: isEditor },
  versions: { drafts: true, maxPerDoc: 30 },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slug,
    seo,
    { name: 'layout', type: 'blocks', blocks: pageBlocks, admin: { initCollapsed: true } },
  ],
}
