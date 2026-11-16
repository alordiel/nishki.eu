/**
 * Minimal Lexical → HTML serializer for the node types the editor produces
 * (paragraph, heading, list, quote, link, linebreak, text formats). Unknown nodes render their children.
 */
type Node = {
  type: string
  children?: Node[]
  text?: string
  format?: number | string
  tag?: string
  listType?: 'bullet' | 'number' | 'check'
  fields?: { url?: string; newTab?: boolean; linkType?: string; doc?: { value?: { slug?: string } } }
  url?: string
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const safeUrl = (u = '') => (/^(https?:|mailto:|tel:|\/|#)/i.test(u.trim()) ? u.trim() : '#')

const FORMAT: [number, string][] = [
  [1, 'strong'],
  [2, 'em'],
  [4, 's'],
  [8, 'u'],
  [16, 'code'],
  [32, 'sub'],
  [64, 'sup'],
]

function text(node: Node): string {
  let out = esc(node.text ?? '')
  const f = typeof node.format === 'number' ? node.format : 0
  for (const [bit, tag] of FORMAT) if (f & bit) out = `<${tag}>${out}</${tag}>`
  return out
}

function align(node: Node) {
  return typeof node.format === 'string' && ['center', 'right', 'justify'].includes(node.format)
    ? ` style="text-align:${node.format}"`
    : ''
}

function serialize(nodes: Node[] = []): string {
  return nodes
    .map((n) => {
      const inner = () => serialize(n.children)
      switch (n.type) {
        case 'text':
          return text(n)
        case 'linebreak':
          return '<br>'
        case 'paragraph':
          return n.children?.length ? `<p${align(n)}>${inner()}</p>` : ''
        case 'heading': {
          const tag = /^h[1-6]$/.test(n.tag ?? '') ? n.tag : 'h3'
          return `<${tag}${align(n)}>${inner()}</${tag}>`
        }
        case 'quote':
          return `<blockquote>${inner()}</blockquote>`
        case 'list': {
          const tag = n.listType === 'number' ? 'ol' : 'ul'
          return `<${tag}>${inner()}</${tag}>`
        }
        case 'listitem':
          return `<li>${inner()}</li>`
        case 'link':
        case 'autolink': {
          const url = n.fields?.url ?? n.url
          const ext = n.fields?.newTab ? ' target="_blank" rel="noopener"' : ''
          return `<a href="${esc(safeUrl(url))}"${ext}>${inner()}</a>`
        }
        case 'horizontalrule':
          return '<hr>'
        default:
          return inner()
      }
    })
    .join('')
}

export function richText(value: unknown): string {
  const root = (value as { root?: Node } | null)?.root
  return root ? serialize(root.children) : ''
}
