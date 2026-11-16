import type { Page, Project } from '@nishki/types'
import { pagePath, projectPath, type Locale } from './i18n'

export type CmsLink = {
  label?: string | null
  type?: 'page' | 'project' | 'custom' | null
  page?: number | Page | null
  project?: number | Project | null
  url?: string | null
}

/** Resolve a CMS link group to an href (null when it points nowhere). */
export function href(link: CmsLink | null | undefined, locale: Locale): string | null {
  if (!link) return null
  if (link.type === 'page' && link.page && typeof link.page === 'object') return pagePath(locale, link.page.slug)
  if (link.type === 'project' && link.project && typeof link.project === 'object') return projectPath(locale, link.project.slug)
  if (link.type === 'custom' && link.url) return link.url
  return null
}

export const isExternal = (h: string) => /^https?:\/\//.test(h)
