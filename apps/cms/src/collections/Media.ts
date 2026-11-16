import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'
import { anyone, isEditor } from '../lib/access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content', defaultColumns: ['filename', 'alt', 'width', 'height', 'updatedAt'] },
  access: {
    // Files are public anyway (they end up on the site); the static build downloads and optimises them.
    read: anyone,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  upload: {
    staticDir: process.env.MEDIA_DIR || path.resolve(dirname, '../../media'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      // Downscaled master used as the source for the static build (keeps builds fast with camera-size originals).
      { name: 'xlarge', width: 2560, withoutEnlargement: true },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Short description of the photo (accessibility & SEO).' },
    },
  ],
}
