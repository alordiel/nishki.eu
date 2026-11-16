/**
 * Seeds the CMS with the content of the six design pages (HTML/1–6) in BG + EN,
 * sample projects, navigation, settings and the read-only build user.
 *
 *   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD=... pnpm seed
 *
 * Refuses to run when pages already exist.
 */
import config from '@payload-config'
import crypto from 'crypto'
import path from 'path'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGES = path.resolve(dirname, '../../seed/images')

const payload = await getPayload({ config })

if ((await payload.count({ collection: 'pages', overrideAccess: true })).totalDocs > 0) {
  payload.logger.warn('[seed] pages already exist — nothing to do')
  process.exit(0)
}
const { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env
const hasUsers = (await payload.count({ collection: 'users', overrideAccess: true })).totalDocs > 0
if (!hasUsers && !(SEED_ADMIN_EMAIL && SEED_ADMIN_PASSWORD)) {
  payload.logger.error('[seed] set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (no users exist yet)')
  process.exit(1)
}

// ── helpers ─────────────────────────────────────────────────────
type Loc = { __l: true; bg: unknown; en: unknown }
const L = (bg: unknown, en: unknown): Loc => ({ __l: true, bg, en })
const isLoc = (v: unknown): v is Loc => typeof v === 'object' && v !== null && (v as Loc).__l === true

/** Resolve L(bg, en) values for one locale. */
const pick = (v: unknown, locale: 'bg' | 'en'): unknown => {
  if (isLoc(v)) return v[locale]
  if (Array.isArray(v)) return v.map((x) => pick(x, locale))
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, pick(x, locale)]))
  return v
}

/** Copy array-row / block ids from the saved BG document so the EN update targets the same rows. */
const withIds = (data: unknown, saved: unknown): unknown => {
  if (Array.isArray(data) && Array.isArray(saved)) {
    return data.map((row, i) => {
      const s = saved[i] as Record<string, unknown> | undefined
      const merged = withIds(row, s)
      return merged && typeof merged === 'object' && !Array.isArray(merged) && s?.id ? { ...merged, id: s.id } : merged
    })
  }
  if (data && typeof data === 'object' && saved && typeof saved === 'object' && !isLexical(data)) {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, withIds(v, (saved as Record<string, unknown>)[k])]),
    )
  }
  return data
}
const isLexical = (v: object) => 'root' in v

// Lexical rich text
const text = (t: string, format = 0) => ({ type: 'text', text: t, format, detail: 0, mode: 'normal', style: '', version: 1 })
const inline = (s: string) =>
  s.split('\n').flatMap((line, i) => (i ? [{ type: 'linebreak', version: 1 }, text(line)] : [text(line)]))
const para = (s: string) => ({
  type: 'paragraph', children: inline(s), direction: 'ltr', format: '', indent: 0, version: 1, textFormat: 0, textStyle: '',
})
const rt = (...paragraphs: string[]) => ({
  root: { type: 'root', children: paragraphs.map(para), direction: 'ltr', format: '', indent: 0, version: 1 },
})

type Collection = 'pages' | 'projects'
async function createLocalized(collection: Collection, data: Record<string, unknown>) {
  const bg = await payload.create({
    collection,
    locale: 'bg',
    overrideAccess: true,
    draft: false,
    data: { ...(pick(data, 'bg') as object), _status: 'published' } as never,
  })
  const saved = await payload.findByID({ collection, id: bg.id, locale: 'bg', depth: 0, overrideAccess: true })
  await payload.update({
    collection,
    id: bg.id,
    locale: 'en',
    overrideAccess: true,
    draft: false,
    data: { ...(withIds(pick(data, 'en'), saved) as object), _status: 'published' } as never,
  })
  return bg
}

// ── media ───────────────────────────────────────────────────────
const mediaSpec: Record<string, [string, string, string]> = {
  homeHero: ['home-hero.jpg', 'Младоженци се прегръщат на поляна', 'Bride and groom embracing in a meadow'],
  stringLights: ['string-lights-bw.jpg', 'Двойка се прегръща под светлини, черно-бяло', 'Couple embracing under string lights, black and white'],
  homeCollage: ['home-collage.jpg', 'Колаж от сватбени детайли', 'Collage of wedding details'],
  yoana: ['yoana.png', 'Портрет на Йоана', 'Portrait of Yoana'],
  maria: ['maria.jpg', 'Портрет на Мария', 'Portrait of Maria'],
  p1: ['project-1.webp', 'Сватбена церемония', 'Wedding ceremony'],
  p2: ['project-2.webp', 'Младоженци по залез', 'Couple at sunset'],
  p3: ['project-3.webp', 'Младоженци край морето', 'Couple by the sea'],
  p4: ['project-4.webp', 'Младоженци в градина', 'Couple in a garden'],
  instagram: ['instagram-strip.webp', 'Снимки от Instagram', 'Photos from Instagram'],
  galleryHero: ['gallery-hero.webp', 'Булка в кола, черно-бяло', 'Bride in a car, black and white'],
  galleryIntro: ['gallery-intro.webp', 'Галерия — not only weddings', 'Gallery — not only weddings'],
  veil: ['veil-wide.jpg', 'Воал, развян от вятъра', 'Veil flowing in the wind'],
  pricesHero: ['prices-hero.jpg', 'Младоженци с развят воал', 'Couple with a flowing veil'],
}
const m: Record<string, number> = {}
for (const [key, [file, bgAlt, enAlt]] of Object.entries(mediaSpec)) {
  const doc = await payload.create({
    collection: 'media',
    locale: 'bg',
    overrideAccess: true,
    data: { alt: bgAlt },
    filePath: path.join(IMAGES, file),
  })
  await payload.update({ collection: 'media', id: doc.id, locale: 'en', overrideAccess: true, data: { alt: enAlt } })
  m[key] = doc.id as number
}
payload.logger.info(`[seed] uploaded ${Object.keys(m).length} images`)

// ── projects ────────────────────────────────────────────────────
const placeholderStory = L(
  rt('[Няколко изречения за тази сватба — историята, мястото, настроението.]'),
  rt('[A few sentences about this wedding — the story, the place, the mood.]'),
)
const projectIds: number[] = []
for (const [i, cover] of [m.p1, m.p2, m.p3, m.p4].entries()) {
  const all = Object.values(m)
  const rotated = [...all.slice(i * 3), ...all.slice(0, i * 3)]
  const p = await createLocalized('projects', {
    title: L('[Имена]', '[Names]'),
    slug: `project-${i + 1}`,
    venue: L('[Място]', '[Venue]'),
    location: L('[Локация]', '[Location]'),
    season: L('[Сезон]', '[Season]'),
    date: new Date(2025, 8 - i, 1).toISOString(),
    cover,
    excerpt: L('[2–3 изречения за тази сватба.]', '[2–3 sentences about this wedding.]'),
    layout: [
      { blockType: 'collage', columns: '3', images: [cover, ...rotated.slice(0, 8)] },
      { blockType: 'lead', content: placeholderStory },
      { blockType: 'collage', columns: '3', images: rotated.slice(8) },
    ],
  })
  projectIds.push(p.id as number)
}

// ── pages ───────────────────────────────────────────────────────
const pageLink = (label: Loc, page: number) => ({ label, type: 'page', page })

const contact = await createLocalized('pages', {
  title: L('Контакти', 'Contact'),
  slug: 'contact',
  seo: { description: L('Разкажете ни за вашия ден — пишете ни за свободни дати и оферта.', 'Tell us about your day — get in touch for availability and a quote.') },
  layout: [
    { blockType: 'sectionHeading', text: L('Свържете се с нас', 'Contact us'), tone: 'accent' },
    {
      blockType: 'contactForm',
      successHeading: L('Благодарим ви!', 'Thank you!'),
      successText: L('Получихме запитването ви и ще се свържем с вас.', 'We have received your enquiry and will get back to you soon.'),
    },
  ],
})

const about = await createLocalized('pages', {
  title: L('За нас', 'About us'),
  slug: 'about',
  seo: { description: L('Йоана и Мария — две гледни точки, една история.', 'Yoana and Maria — two points of view, one story.') },
  layout: [
    { blockType: 'sectionHeading', text: L('За нас', 'About us'), tone: 'accent' },
    {
      blockType: 'tiles',
      items: [
        { kind: 'image', image: m.yoana },
        {
          kind: 'text',
          heading: L('Йоана', 'Yoana'),
          body: L(
            'Йоана открива дълбочината чрез свързването – създава пространство на доверие, в което хората се отпускат и разкриват.',
            'Yoana finds depth through connection – she creates a space of trust where people relax and open up.',
          ),
        },
        {
          kind: 'text',
          heading: L('Мария', 'Maria'),
          body: L(
            'Мария носи фин усет към естетиката – вижда рамката, светлината и детайлите, които правят един момент красив.',
            'Maria brings a fine sense of aesthetics – she sees the frame, the light and the details that make a moment beautiful.',
          ),
        },
        { kind: 'image', image: m.maria },
      ],
    },
    {
      blockType: 'lead',
      content: L(
        rt(
          'Вдъхновени от красотата и интимността на човешките взаимоотношения, ние създаваме дишащи картини, които се съпреживяват със сърцето, а не просто се гледат с очите.',
          'Снимаме заедно като танц. Съчетаваме две гледни точки - нещо, което сам фотограф не би успял да постигне. Преливайки от чувство към форма, за нас фотографията е начин да съхраним усещанията за деня такъв, какъвто е бил. Жив, истински и неподправен.',
        ),
        rt(
          'Inspired by the beauty and intimacy of human relationships, we create living pictures that are felt with the heart, not just seen with the eyes.',
          'We shoot together, like a dance, combining two points of view – something a single photographer could not achieve. Flowing from feeling into form, photography for us is a way to keep the feeling of the day as it was: alive, real and unretouched.',
        ),
      ),
    },
  ],
})

const gallery = await createLocalized('pages', {
  title: L('Галерия', 'Gallery'),
  slug: 'gallery',
  seo: { description: L('Избрани сватби и сесии.', 'Selected weddings and sessions.') },
  layout: [
    { blockType: 'hero', image: m.galleryHero, caption: L('-мега колаж-', '-mega collage-'), height: 'medium', align: 'left' },
    { blockType: 'imageBanner', image: m.galleryIntro, height: 'natural' },
    { blockType: 'projectsGrid', source: 'all' },
    { blockType: 'collage', columns: '5', images: Object.values(m).filter((id) => id !== m.galleryIntro && id !== m.instagram) },
  ],
})

await createLocalized('pages', {
  title: L('Цени', 'Prices'),
  slug: 'prices',
  seo: { description: L('Цената за сватбен ден започва от 2000 EUR.', 'Wedding day coverage starts at 2000 EUR.') },
  layout: [
    { blockType: 'imageBanner', image: m.pricesHero, height: 'small' },
    { blockType: 'sectionHeading', text: L('Цени', 'Prices'), tone: 'accent' },
    {
      blockType: 'richText',
      content: L(
        rt(
          'Заплащането на нашия труд се оформя индивидуално за всеки проект поради различната ангажираност и специфики.',
          'Цената за сватбен ден в рамките на страната започва от 2000 EUR. С удоволствие пътуваме и извън България, освен това можем да окажем съдействие със странични теми като грим, прическа и декор.',
          'Предсватбена, следсватбена, каталог',
          'За да получите конкретна оферта, ни е необходима повече информация. Заповядайте да си поговорим, започвайки от формата ни за контакт тук:',
        ),
        rt(
          'Our fee is tailored to each project, as every event involves a different commitment and specifics.',
          'Wedding day coverage within Bulgaria starts at 2000 EUR. We are happy to travel abroad and can also help with make-up, hair and décor.',
          'Pre-wedding, post-wedding and catalogue sessions',
          'To prepare a quote we need a little more information. Let’s talk — start with our contact form:',
        ),
      ),
      button: pageLink(L('Свържете се с нас', 'Contact us'), contact.id as number),
    },
    { blockType: 'sectionHeading', text: L('Често задавани въпроси', 'Frequently asked questions'), tone: 'accent' },
    {
      blockType: 'faq',
      items: [
        {
          question: L('Пътувате ли до различни места в България и в чужбина за сватби?', 'Do you travel to different places in Bulgaria and abroad?'),
          answer: L(
            rt('Да, повечето сватби, които снимаме, са на най-различни локации. С удоволствие посещаваме нови места, на които не сме били досега — вдъхновяващо е.'),
            rt('Yes — most of the weddings we photograph are in all kinds of locations. We love discovering new places; it is inspiring.'),
          ),
        },
        {
          question: L('Пътувате ли извън България?', 'Do you travel outside Bulgaria?'),
          answer: L(
            rt('Да.\nПътуването винаги е било важна част от живота ни и с радост снимаме сватби, семейни сесии и други значими събития, където и да се случват.\nАко планирате нещо извън България, разкажете ни повече. Ще се радваме да чуем историята ви.'),
            rt('Yes.\nTravel has always been an important part of our lives, and we are happy to photograph weddings, family sessions and other meaningful events wherever they happen.\nIf you are planning something outside Bulgaria, tell us more — we would love to hear your story.'),
          ),
        },
        {
          question: L('Помагате ли в процеса на планиране на сватбата?', 'Do you help with planning the wedding?'),
          answer: L(
            rt('Да, винаги, когато имате нужда от съвет или препоръка, сме насреща. Били сме на доста сватби (над 400) и вярваме, че с опита си можем да ви бъдем полезни. На първо място, това е вашият ден и е важно да се случи така, както вие го желаете и си го представяте.'),
            rt('Yes — whenever you need advice or a recommendation, we are here. We have been to a lot of weddings (more than 400) and believe our experience can help. Above all, it is your day, and it should happen the way you want and imagine it.'),
          ),
        },
        {
          question: L('Възстановим ли е депозитът?', 'Is the deposit refundable?'),
          answer: L(
            rt('Депозитът е за запазване на датата и не се възстановява при отменяне на събитието. При промяна на датата може да се ползва като депозит за новата дата, ако е свободна. При форсмажорни обстоятелства и невъзможност да се проведе събитието, депозитът може да се използва като ваучер за фотосесия с валидност до една година от първоначално насрочената дата на събитието.'),
            rt('The deposit reserves the date and is not refunded if the event is cancelled. If the date changes, it can be used as the deposit for the new date, if available. In case of force majeure, the deposit can be used as a voucher for a photo session, valid for one year from the originally scheduled date.'),
          ),
        },
      ],
    },
  ],
})

const privacy = await createLocalized('pages', {
  title: L('Поверителност', 'Privacy'),
  slug: 'privacy',
  seo: { noindex: true },
  layout: [
    { blockType: 'sectionHeading', text: L('Политика за поверителност', 'Privacy policy'), tone: 'accent' },
    {
      blockType: 'richText',
      content: L(
        rt('[ЧЕРНОВА — текстът трябва да бъде прегледан от юрист.]', 'Данните от формата за контакт (име, имейл, телефон, информация за събитието) се използват само за да отговорим на запитването ви и се изтриват автоматично след 12 месеца. Може да поискате копие или изтриване на данните си на имейла ни.'),
        rt('[DRAFT — to be reviewed by a lawyer.]', 'Data from the contact form (name, email, phone, event details) is used only to answer your enquiry and is deleted automatically after 12 months. You can request a copy or deletion of your data by emailing us.'),
      ),
    },
  ],
})

await createLocalized('pages', {
  title: L('Начало', 'Home'),
  slug: 'home',
  seo: {
    title: L('Nishki — бутикова сватбена фотография', 'Nishki — boutique wedding photography'),
    description: L(
      'Дишащи картини, които се съпреживяват със сърцето, а не просто с очите. Сватбена фотография от Йоана и Мария.',
      'Living pictures, felt with the heart rather than just seen with the eyes. Wedding photography by Yoana and Maria.',
    ),
  },
  layout: [
    { blockType: 'hero', image: m.homeHero, heading: L('Елегантно.\nИнтимно.\nОт сърце.', 'Elegant.\nIntimate.\nFrom the heart.'), height: 'full', align: 'right' },
    {
      blockType: 'tagline',
      heading: L('Бутикова сватбена фотография', 'Boutique wedding photography'),
      subheading: L('Дишащи картини, които се съпреживяват със сърцето, а не просто с очите', 'Living pictures, felt with the heart rather than just seen with the eyes'),
    },
    {
      blockType: 'team',
      heading: L('Ние сме Йоана и Мария', 'We are Yoana & Maria'),
      members: [{ image: m.yoana }, { image: m.maria }],
      link: pageLink(L('Повече за нас', 'More about us'), about.id as number),
    },
    { blockType: 'imageBanner', image: m.homeCollage, height: 'large' },
    {
      blockType: 'featuredProjects',
      heading: L('Любими проекти', 'Favourite projects'),
      projects: projectIds,
      link: pageLink(L('Разгледай още', 'See more'), gallery.id as number),
    },
    {
      blockType: 'testimonial',
      quote: L('[Отзив от клиенти: няколко изречения за преживяването и снимките.]', '[Client testimonial: a few sentences about the experience and the photographs.]'),
    },
    { blockType: 'instagram', image: m.instagram, heading: L('Последвай ни в Instagram', 'Follow us on Instagram') },
  ],
})

// ── globals ─────────────────────────────────────────────────────
const pagesBySlug = Object.fromEntries(
  (await payload.find({ collection: 'pages', limit: 50, depth: 0, overrideAccess: true })).docs.map((p) => [p.slug, p.id]),
)
const nav = {
  header: {
    items: [
      { link: pageLink(L('Начало', 'Home'), pagesBySlug.home) },
      { link: pageLink(L('За нас', 'About'), pagesBySlug.about) },
      { link: pageLink(L('Галерия', 'Gallery'), pagesBySlug.gallery) },
      { link: pageLink(L('Цени', 'Prices'), pagesBySlug.prices) },
    ],
    cta: pageLink(L('Свържете се с нас', 'Contact us'), contact.id as number),
  },
  footer: { cta: pageLink(L('Свържете се с нас', 'Contact us'), contact.id as number) },
}
await payload.updateGlobal({ slug: 'navigation', locale: 'bg', overrideAccess: true, data: pick(nav, 'bg') as never })
const savedNav = await payload.findGlobal({ slug: 'navigation', locale: 'bg', depth: 0, overrideAccess: true })
await payload.updateGlobal({ slug: 'navigation', locale: 'en', overrideAccess: true, data: withIds(pick(nav, 'en'), savedNav) as never })

const settings = {
  siteName: 'Nishki',
  contactEmail: process.env.OWNER_EMAIL || undefined,
  social: { instagram: 'https://www.instagram.com/' },
  privacyPage: privacy.id,
  defaultSeo: {
    title: L('Nishki — бутикова сватбена фотография', 'Nishki — boutique wedding photography'),
    description: L('Сватбена фотография от Йоана и Мария.', 'Wedding photography by Yoana and Maria.'),
    image: m.homeHero,
  },
}
await payload.updateGlobal({ slug: 'site-settings', locale: 'bg', overrideAccess: true, data: pick(settings, 'bg') as never })
await payload.updateGlobal({ slug: 'site-settings', locale: 'en', overrideAccess: true, data: pick(settings, 'en') as never })

// ── users ───────────────────────────────────────────────────────
if (SEED_ADMIN_EMAIL && SEED_ADMIN_PASSWORD) {
  await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: { email: SEED_ADMIN_EMAIL, password: SEED_ADMIN_PASSWORD, role: 'admin', name: 'Admin' },
  })
  payload.logger.info(`[seed] admin user ${SEED_ADMIN_EMAIL} created`)
}
const apiKey = crypto.randomUUID()
await payload.create({
  collection: 'users',
  overrideAccess: true,
  data: {
    email: 'build@nishki.invalid',
    password: crypto.randomBytes(24).toString('base64url'),
    role: 'build',
    name: 'Static site build',
    enableAPIKey: true,
    apiKey,
  },
})

payload.logger.info('[seed] done')
console.log(`\nRead-only build API key (put it in CMS_API_KEY for apps/web):\n${apiKey}\n`)
process.exit(0)
