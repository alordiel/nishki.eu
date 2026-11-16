import type { GlobalConfig } from 'payload'
import { link } from '../fields/link'
import { isContentReader, isEditor } from '../lib/access'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: { group: 'Settings' },
  access: { read: isContentReader, update: isEditor },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'items', type: 'array', maxRows: 8, fields: [link('link', { required: true })] },
        { ...link('cta', { label: 'Button' }) },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      fields: [{ ...link('cta', { label: 'Button' }) }],
    },
  ],
}
