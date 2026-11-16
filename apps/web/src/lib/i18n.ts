export const locales = ['bg', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'bg'

export const htmlLang: Record<Locale, string> = { bg: 'bg', en: 'en' }
export const ogLocale: Record<Locale, string> = { bg: 'bg_BG', en: 'en_GB' }

/** URL prefix for a locale: "/" for Bulgarian, "/en/" for English. */
export const prefix = (locale: Locale) => (locale === defaultLocale ? '/' : `/${locale}/`)

export const PROJECTS_BASE = 'gallery'

export const pagePath = (locale: Locale, slug: string) => (slug === 'home' ? prefix(locale) : `${prefix(locale)}${slug}/`)
export const projectPath = (locale: Locale, slug: string) => `${prefix(locale)}${PROJECTS_BASE}/${slug}/`

/** Same page in another locale. */
export const switchLocale = (path: string, from: Locale, to: Locale) => {
  const rest = from === defaultLocale ? path.slice(1) : path.slice(`/${from}/`.length)
  return `${prefix(to)}${rest}`
}

/** Fixed interface strings (everything else is edited in the CMS). */
export const ui = {
  bg: {
    menu: 'Меню',
    close: 'Затвори',
    changeLanguage: 'Смяна на езика',
    backToTop: 'Към началото',
    skip: 'Към съдържанието',
    notFound: 'Страницата не е намерена',
    notFoundText: 'Тази страница не съществува или е преместена.',
    home: 'Към началната страница',
    form: {
      name: 'Вашето име',
      email: 'Имейл',
      phone: 'Телефон',
      weddingDate: 'Дата на сватбата',
      weddingLocation: 'Място на събитието',
      weddingNotes: 'Допълнителна информация',
      guests: 'Колко гости очаквате?',
      services: 'Какво ви интересува? (може да изберете повече от едно)',
      origin: 'Как ни открихте? (може да изберете повече от едно)',
      message: 'Разкажете ни за вашия ден',
      submit: 'Изпрати',
      sending: 'Изпращане…',
      again: 'Ново запитване',
      privacy: 'Използваме данните ви само за да отговорим на запитването. Повече в',
      privacyLink: 'политиката за поверителност',
      errors: {
        validation: 'Моля, попълнете всички полета коректно.',
        captcha: 'Проверката срещу спам не беше успешна. Моля, опитайте отново.',
        rate_limited: 'Изпратихте твърде много запитвания. Опитайте отново след малко.',
        server: 'Нещо се обърка. Моля, опитайте отново или ни пишете на имейл.',
      },
    },
    guests: { '<50': 'до 50', '50-100': '50–100', '100-150': '100–150', '150+': 'над 150' },
    services: {
      'wedding photography': 'Сватбена фотография',
      'before-the-wedding photography': 'Предсватбена фотосесия',
      video: 'Видео',
      'photo-album': 'Албум',
    },
    origins: { Insta: 'Instagram', Facebook: 'Facebook', friends: 'Препоръка от приятели', web: 'Интернет' },
  },
  en: {
    menu: 'Menu',
    close: 'Close',
    changeLanguage: 'Change language',
    backToTop: 'Back to top',
    skip: 'Skip to content',
    notFound: 'Page not found',
    notFoundText: 'This page does not exist or has moved.',
    home: 'Go to the home page',
    form: {
      name: 'Your name',
      email: 'Email',
      phone: 'Phone',
      weddingDate: 'Wedding date',
      weddingLocation: 'Venue / location',
      weddingNotes: 'Additional information',
      guests: 'How many guests do you expect?',
      services: 'What are you interested in? (choose any)',
      origin: 'How did you find us? (choose any)',
      message: 'Tell us about your day',
      submit: 'Send',
      sending: 'Sending…',
      again: 'New enquiry',
      privacy: 'We use your details only to reply to your enquiry. Read our',
      privacyLink: 'privacy policy',
      errors: {
        validation: 'Please fill in all fields correctly.',
        captcha: 'The spam check failed. Please try again.',
        rate_limited: 'Too many enquiries. Please try again in a few minutes.',
        server: 'Something went wrong. Please try again or email us.',
      },
    },
    guests: { '<50': 'up to 50', '50-100': '50–100', '100-150': '100–150', '150+': '150+' },
    services: {
      'wedding photography': 'Wedding photography',
      'before-the-wedding photography': 'Pre-wedding session',
      video: 'Video',
      'photo-album': 'Photo album',
    },
    origins: { Insta: 'Instagram', Facebook: 'Facebook', friends: 'Friends’ recommendation', web: 'Web search' },
  },
} as const

/** "/en/about/" → "en/about" (undefined for the root) — the [...path] route param. */
export const toParam = (path: string) => path.replace(/^\/|\/$/g, '') || undefined
