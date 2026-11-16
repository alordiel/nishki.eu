import type { CollectionConfig } from 'payload'
import { canUseAdmin, hasRole, isAdmin, isAdminField } from '../lib/access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
    group: 'System',
    hidden: ({ user }) => !hasRole(user, 'admin'),
  },
  auth: {
    useAPIKey: true,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 8 * 60 * 60,
    cookies: { secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' },
  },
  access: {
    admin: canUseAdmin,
    create: isAdmin,
    delete: isAdmin,
    read: ({ req: { user } }) => (hasRole(user, 'admin') ? true : user ? { id: { equals: user.id } } : false),
    update: ({ req: { user } }) => (hasRole(user, 'admin') ? true : user ? { id: { equals: user.id } } : false),
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Build (read-only API key)', value: 'build' },
      ],
      access: { update: isAdminField },
      admin: {
        description: 'Admin: everything. Editor: pages, projects, media, navigation, submissions. Build: read-only API key for the static site build.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      // Until an admin exists, any new human account becomes an admin (covers the "create first user" screen).
      async ({ req, operation, data }) => {
        if (operation === 'create' && data.role !== 'build') {
          const { totalDocs } = await req.payload.count({
            collection: 'users',
            overrideAccess: true,
            where: { role: { equals: 'admin' } },
          })
          if (totalDocs === 0) data.role = 'admin'
        }
        return data
      },
    ],
  },
}
