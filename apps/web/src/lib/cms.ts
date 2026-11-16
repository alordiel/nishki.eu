import type { Media, Navigation, Page, Project, SiteSetting } from '@nishki/types'
import type { Locale } from './i18n'

/**
 * Build-time client for the Payload REST API (read-only API key).
 * Responses are memoised for the duration of one build.
 */
const CMS_URL = (import.meta.env.CMS_URL || 'http://localhost:3000').replace(/\/$/, '')
const API_KEY = import.meta.env.CMS_API_KEY

const cache = new Map<string, Promise<unknown>>()

async function get<T>(path: string): Promise<T> {
  const url = `${CMS_URL}/api${path}`
  if (!cache.has(url)) {
    cache.set(
      url,
      (async () => {
        const res = await fetch(url, { headers: API_KEY ? { Authorization: `users API-Key ${API_KEY}` } : {} })
        if (!res.ok) throw new Error(`CMS request failed: ${res.status} ${url}\n${await res.text()}`)
        return res.json()
      })(),
    )
  }
  return cache.get(url) as Promise<T>
}

const published = 'where[_status][equals]=published'

export const getPages = async (locale: Locale) =>
  (await get<{ docs: Page[] }>(`/pages?locale=${locale}&depth=2&pagination=false&${published}`)).docs

export const getProjects = async (locale: Locale) =>
  (await get<{ docs: Project[] }>(`/projects?locale=${locale}&depth=1&pagination=false&sort=-date&${published}`)).docs

export const getSettings = (locale: Locale) => get<SiteSetting>(`/globals/site-settings?locale=${locale}&depth=1`)
export const getNavigation = (locale: Locale) => get<Navigation>(`/globals/navigation?locale=${locale}&depth=1`)

/** Absolute URL of the best source for a media document (downscaled master when available). */
export function mediaSrc(m: Media): string {
  const path = m.sizes?.xlarge?.url || m.url || ''
  // Payload returns absolute URLs on its serverURL (admin host); always fetch from CMS_URL instead.
  const pathname = path.startsWith('http') ? new URL(path).pathname : path
  return `${CMS_URL}${pathname}`
}

export function mediaSize(m: Media): { width: number; height: number } {
  const x = m.sizes?.xlarge
  if (x?.width && x?.height) return { width: x.width, height: x.height }
  return { width: m.width || 1600, height: m.height || 1067 }
}

export const isMedia = (v: unknown): v is Media => typeof v === 'object' && v !== null && 'filename' in v
export const isProject = (v: unknown): v is Project => typeof v === 'object' && v !== null && 'slug' in v && 'cover' in v
