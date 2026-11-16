import type { GlobalConfig } from 'payload'
import { isAdmin, isContentReader } from '../lib/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Settings' },
  access: { read: isContentReader, update: isAdmin },
  versions: { drafts: false, max: 10 },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'Nishki', localized: true },
    { name: 'logo', type: 'upload', relationTo: 'media', admin: { description: 'SVG/PNG. If empty, the site name is shown as text.' } },
    {
      type: 'row',
      fields: [
        { name: 'contactEmail', type: 'email' },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'social',
      type: 'group',
      fields: [
        { name: 'instagram', type: 'text' },
        { name: 'facebook', type: 'text' },
      ],
    },
    {
      name: 'defaultSeo',
      label: 'Default SEO',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'privacyPage',
      type: 'relationship',
      relationTo: 'pages',
      admin: { description: 'Linked from the privacy notice under the contact form.' },
    },
  ],
}
