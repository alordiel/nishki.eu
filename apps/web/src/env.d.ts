/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly CMS_URL?: string
  readonly CMS_API_KEY?: string
  readonly PUBLIC_SITE_URL?: string
  readonly PUBLIC_CONTACT_ENDPOINT?: string
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
