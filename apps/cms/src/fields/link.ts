import type { Field, GroupField } from 'payload'

/** A link that points to a CMS page, a project, or a custom URL. */
export const link = (name = 'link', opts: { required?: boolean; label?: string } = {}): GroupField => ({
  name,
  label: opts.label,
  type: 'group',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', localized: true, required: opts.required, admin: { width: '40%' } },
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'page',
          options: [
            { label: 'Page', value: 'page' },
            { label: 'Project', value: 'project' },
            { label: 'URL', value: 'custom' },
          ],
          admin: { width: '60%' },
        },
      ],
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      admin: { condition: (_, s) => s?.type === 'page' },
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      admin: { condition: (_, s) => s?.type === 'project' },
    },
    {
      name: 'url',
      type: 'text',
      admin: { condition: (_, s) => s?.type === 'custom', description: 'Absolute URL, mailto:, tel: or a path such as /contact' },
    },
  ],
})

export const seo: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: { position: 'sidebar' },
  fields: [
    { name: 'title', type: 'text', localized: true, maxLength: 70 },
    { name: 'description', type: 'textarea', localized: true, maxLength: 170 },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Open Graph image (1200×630 works best)' } },
    { name: 'noindex', type: 'checkbox', defaultValue: false },
  ],
}

const slugify = (v: string) =>
  v
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const slug: Field = {
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Latin letters, digits and dashes. The home page uses "home".',
  },
  hooks: {
    beforeValidate: [({ value }) => (typeof value === 'string' ? slugify(value) : value)],
  },
}
