import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Projects } from './collections/Projects'
import { Submissions } from './collections/Submissions'
import { Users } from './collections/Users'
import { BuildStatus } from './globals/BuildStatus'
import { Navigation } from './globals/Navigation'
import { SiteSettings } from './globals/SiteSettings'
import { publishEndpoints } from './lib/publish'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const origins = [process.env.ADMIN_URL, process.env.SERVER_URL].filter(Boolean) as string[]

const email = process.env.EMAIL_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@nishki.eu',
      defaultFromName: process.env.EMAIL_FROM_NAME || 'Nishki',
      transportOptions: {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 587),
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      },
    })
  : undefined // dev: Payload logs emails to the console

export default buildConfig({
  serverURL: process.env.ADMIN_URL || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' — Nishki admin' },
    components: {
      actions: ['/components/PublishButton#PublishButton'],
    },
  },
  collections: [Pages, Projects, Media, Submissions, Users],
  globals: [SiteSettings, Navigation, BuildStatus],
  localization: {
    locales: [
      { label: 'Български', code: 'bg' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'bg',
    fallback: true,
  },
  editor: lexicalEditor(),
  endpoints: publishEndpoints,
  graphQL: { disable: true },
  cors: origins,
  csrf: origins,
  secret: process.env.PAYLOAD_SECRET || '',
  upload: { limits: { fileSize: 40_000_000 } },
  typescript: {
    outputFile: path.resolve(dirname, '../../../packages/types/src/payload-types.ts'),
  },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || 'file:./data/nishki.db' },
  }),
  email,
  sharp,
})
