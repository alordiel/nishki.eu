import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'
// Real environment variables win over .env (Node's loader never overrides existing ones).
try {
  process.loadEnvFile('.env')
} catch {
  /* no .env file */
}
const env = process.env
const site = env.PUBLIC_SITE_URL || 'https://nishki.eu'
const cms = new URL(env.CMS_URL || 'http://localhost:3000')

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  image: {
    // Images are downloaded from the CMS at build time and optimised into dist/_astro.
    remotePatterns: [{ protocol: cms.protocol.replace(':', ''), hostname: cms.hostname, ...(cms.port ? { port: cms.port } : {}) }],
  },
  vite: {
    // Keep every script external so the CSP needs no 'unsafe-inline' for scripts.
    build: { assetsInlineLimit: 0 },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/privacy/'),
    }),
  ],
})
