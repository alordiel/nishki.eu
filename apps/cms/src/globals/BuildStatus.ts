import type { GlobalConfig } from 'payload'
import { isEditor, nobody } from '../lib/access'

/** Written only by the publish pipeline (overrideAccess). Shown read-only in the admin. */
export const BuildStatus: GlobalConfig = {
  slug: 'build-status',
  label: 'Publish status',
  admin: { group: 'System' },
  access: { read: isEditor, update: nobody },
  fields: [
    {
      name: 'state',
      type: 'select',
      defaultValue: 'idle',
      options: ['idle', 'running', 'success', 'failed', 'triggered'].map((v) => ({ label: v, value: v })),
      admin: { readOnly: true },
    },
    { name: 'queued', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
    { name: 'startedAt', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'finishedAt', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'lastSuccessAt', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'triggeredBy', type: 'text', admin: { readOnly: true } },
    { name: 'message', type: 'textarea', admin: { readOnly: true } },
  ],
}
