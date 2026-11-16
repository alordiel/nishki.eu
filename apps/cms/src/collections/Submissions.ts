import type { CollectionConfig, Field } from 'payload'
import { isAdmin, isEditor, nobody } from '../lib/access'

export const GUEST_OPTIONS = ['<50', '50-100', '100-150', '150+'] as const
export const SERVICE_OPTIONS = ['wedding photography', 'before-the-wedding photography', 'video', 'photo-album'] as const
export const ORIGIN_OPTIONS = ['Insta', 'Facebook', 'friends', 'web'] as const

const ro = (f: Field): Field => ({
  ...f,
  access: { create: nobody, update: nobody },
  admin: { ...(f as { admin?: object }).admin, readOnly: true },
} as Field)

/** Contact form entries. Created only by POST /contact (server side). Everything except status is read-only. */
export const Submissions: CollectionConfig = {
  slug: 'submissions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'weddingDate', 'status', 'createdAt'],
    group: 'Inbox',
    listSearchableFields: ['name', 'email', 'weddingLocation'],
  },
  access: {
    create: nobody,
    read: isEditor,
    update: isEditor,
    delete: isAdmin,
  },
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      required: true,
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Read', value: 'read' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
    ro({ name: 'name', type: 'text', required: true }),
    ro({ name: 'email', type: 'email', required: true }),
    ro({ name: 'phone', type: 'text' }),
    ro({ name: 'weddingDate', type: 'text' }),
    ro({ name: 'weddingLocation', type: 'text' }),
    ro({ name: 'weddingNotes', type: 'textarea' }),
    ro({ name: 'message', type: 'textarea' }),
    ro({ name: 'numberOfGuests', type: 'select', options: [...GUEST_OPTIONS] }),
    ro({ name: 'typeOfServices', type: 'select', hasMany: true, options: [...SERVICE_OPTIONS] }),
    ro({ name: 'origin', type: 'select', hasMany: true, options: [...ORIGIN_OPTIONS] }),
    ro({ name: 'locale', type: 'text', admin: { position: 'sidebar' } }),
    ro({ name: 'ip', type: 'text', admin: { position: 'sidebar' } }),
    ro({ name: 'userAgent', type: 'text', admin: { position: 'sidebar' } }),
    ro({ name: 'emailSent', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } }),
    ro({ name: 'emailError', type: 'text', admin: { position: 'sidebar', condition: (d) => Boolean(d?.emailError) } }),
  ],
}
