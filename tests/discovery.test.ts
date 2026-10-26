/**
 * Kiểm tra các tài nguyên khám phá (discovery) mà trang công khai và middleware
 * đã hứa: robots.txt, sitemap.xml, llms.txt và OG image 1200x630.
 *
 *   node --test tests/discovery.test.ts
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { config as middlewareConfig } from '../middleware.ts'
import { publicLinks, spaRoutes, staticFiles } from '../src/agent/routes.ts'
import { site } from '../src/agent/site.ts'

const origin = 'https://huybui.vercel.app'
const publicDir = join(process.cwd(), 'public')

const routePaths = new Set<string>(spaRoutes)
const filePaths = new Set<string>(staticFiles)

// Tập trang công khai và tập file tĩnh lấy từ bảng route của chính dự án
// (src/agent/routes.ts) để test không chép lại một danh sách riêng.
const publicPagePaths = publicLinks.map(link => link.href).filter(href => routePaths.has(href))
const publicFilePaths = publicLinks.map(link => link.href).filter(href => filePaths.has(href))
const expectedLinkPaths = new Set<string>([...publicPagePaths, ...publicFilePaths])
const expectedCanonicalUrls = publicPagePaths.map(path => (path === '/' ? `${origin}/` : `${origin}${path}`))

function readPublicFile(name: string) {
  const path = join(publicDir, name)
  assert.ok(existsSync(path), `public/${name} chưa tồn tại`)
  return readFileSync(path, 'utf8')
}

/** Một đường dẫn chỉ "có thật" khi nó là route của dự án, hoặc là file tĩnh có sẵn trong public/. */
function resolvesToRealResource(path: string) {
  if (routePaths.has(path)) return true
  if (filePaths.has(path)) return existsSync(join(publicDir, path.replace(/^\//, '')))
  return false
}

type XmlElement = {
  name: string
  attributes: Record<string, string>
  children: XmlElement[]
  text: string
}

/**
 * Parser XML tối giản: đủ để chứng minh sitemap.xml là XML well-formed mà không
 * thêm dependency mới vào dự án.
 */
function parseXml(source: string): XmlElement {
  let cursor = 0

  const fail = (message: string): never => {
    throw new Error(`XML is not well-formed: ${message} (at offset ${cursor})`)
  }

  const skipSpace = () => {
    while (cursor < source.length && /\s/.test(source[cursor])) cursor += 1
  }

  const readName = () => {
    const start = cursor
    while (cursor < source.length && /[A-Za-z0-9_.:-]/.test(source[cursor])) cursor += 1
    if (cursor === start) fail('expected a name')
    return source.slice(start, cursor)
  }

  const parseElement = (): XmlElement => {
    if (source[cursor] !== '<') fail('expected an element')
    cursor += 1
    const name = readName()
    const attributes: Record<string, string> = {}
    for (;;) {
      skipSpace()
      if (source.startsWith('/>', cursor)) {
        cursor += 2
        return { name, attributes, children: [], text: '' }
      }
      if (source[cursor] === '>') {
        cursor += 1
        break
      }
      const attributeName = readName()
      skipSpace()
      if (source[cursor] !== '=') fail(`expected "=" after ${attributeName}`)
      cursor += 1
      skipSpace()
      const quote = source[cursor]
      if (quote !== '"' && quote !== "'") fail(`expected a quoted value for ${attributeName}`)
      cursor += 1
      const valueStart = cursor
      while (cursor < source.length && source[cursor] !== quote) cursor += 1
      if (cursor >= source.length) fail(`unterminated value for ${attributeName}`)
      attributes[attributeName] = source.slice(valueStart, cursor)
      cursor += 1
    }

    const children: XmlElement[] = []
    let text = ''
    for (;;) {
      if (cursor >= source.length) fail(`<${name}> is never closed`)
      if (source.startsWith('</', cursor)) {
        cursor += 2
        const closingName = readName()
        skipSpace()
        if (source[cursor] !== '>') fail(`expected ">" to close ${closingName}`)
        cursor += 1
        if (closingName !== name) fail(`</${closingName}> does not close <${name}>`)
        return { name, attributes, children, text: text.trim() }
      }
      if (source.startsWith('<!--', cursor)) {
        const end = source.indexOf('-->', cursor)
        if (end === -1) fail('unterminated comment')
        cursor = end + 3
        continue
      }
      if (source[cursor] === '<') {
        children.push(parseElement())
        continue
      }
      const nextTag = source.indexOf('<', cursor)
      text += source.slice(cursor, nextTag === -1 ? source.length : nextTag)
      cursor = nextTag === -1 ? source.length : nextTag
    }
  }

  skipSpace()
  while (source.startsWith('<?', cursor) || source.startsWith('<!', cursor)) {
    const end = source.indexOf('>', cursor)
    if (end === -1) fail('unterminated declaration')
    cursor = end + 1
    skipSpace()
  }
  const root = parseElement()
  skipSpace()
  if (cursor !== source.length) fail('there is content after the root element')
  return root
}

test('the discovery files exist in public/', () => {
  for (const name of ['robots.txt', 'sitemap.xml', 'llms.txt', 'og-image.png']) {
    assert.ok(existsSync(join(publicDir, name)), `public/${name} chưa tồn tại`)
  }
})

test('robots.txt allows the public pages, blocks the private areas and names the sitemap', () => {
  const robots = readPublicFile('robots.txt')
  assert.match(robots, /^User-agent: \*$/m)
  assert.match(robots, /^Allow: \/$/m)
  assert.match(robots, /^Disallow: \/app\/$/m)
  assert.match(robots, /^Disallow: \/admin$/m)
  assert.match(robots, /^Disallow: \/auth\/$/m)
  assert.match(robots, /^Sitemap: https:\/\/huybui\.vercel\.app\/sitemap\.xml$/m)
})

test('robots.txt references only files that really exist', () => {
  const robots = readPublicFile('robots.txt')
  const references = [...robots.matchAll(/\S+\.[A-Za-z0-9]+/g)].map(match => match[0])
  assert.ok(references.length > 0, 'robots.txt phải trỏ tới sitemap')
  for (const reference of references) {
    const path = reference.startsWith('http')
      ? new URL(reference).pathname
      : reference.startsWith('/')
        ? reference
        : `/${reference}`
    assert.ok(resolvesToRealResource(path), `${reference} không trỏ tới route hay file có thật`)
  }
})

test('sitemap.xml is well-formed XML with the sitemap namespace', () => {
  const root = parseXml(readPublicFile('sitemap.xml'))
  assert.equal(root.name, 'urlset')
  assert.equal(root.attributes.xmlns, 'http://www.sitemaps.org/schemas/sitemap/0.9')
})

test('sitemap.xml lists exactly the four canonical public pages', () => {
  const root = parseXml(readPublicFile('sitemap.xml'))
  assert.equal(publicPagePaths.length, 4, 'bảng route phải có đúng bốn trang công khai')
  const urls = root.children.filter(child => child.name === 'url')
  assert.equal(urls.length, expectedCanonicalUrls.length)
  const locations = urls.map(url => {
    const loc = url.children.find(child => child.name === 'loc')
    assert.ok(loc, 'mỗi <url> cần có <loc>')
    return loc.text
  })
  assert.deepEqual([...locations].sort(), [...expectedCanonicalUrls].sort())
})

test('sitemap.xml never points at a private area, a preview URL or an essay', () => {
  const sitemap = readPublicFile('sitemap.xml')
  for (const fragment of ['/admin', '/auth', '/app/', '/donate', 'preview', 'essays']) {
    assert.ok(!sitemap.includes(fragment), `sitemap.xml không được chứa ${fragment}`)
  }
})

test('llms.txt follows the llms.txt proposal', () => {
  const llms = readPublicFile('llms.txt')
  assert.ok(llms.startsWith('# '), 'llms.txt phải bắt đầu bằng một H1')
  assert.ok(llms.startsWith(`# ${site.name}`), 'H1 phải chứa tên sản phẩm')
  assert.match(llms, /^> .+/m, 'llms.txt phải có một blockquote tóm tắt')
  const sections = [...llms.matchAll(/^## .+$/gm)]
  assert.ok(sections.length >= 2, 'llms.txt phải có ít nhất hai mục "##"')
})

test('llms.txt points at the four public pages with absolute production URLs', () => {
  const llms = readPublicFile('llms.txt')
  for (const url of expectedCanonicalUrls) {
    assert.ok(llms.includes(url), `llms.txt thiếu ${url}`)
  }
})

test('llms.txt says which parts need a signed-in session', () => {
  const llms = readPublicFile('llms.txt')
  assert.match(llms, /signed-in session/i)
  for (const feature of ['writing space', 'essay', 'vocabulary', 'review', 'progress', 'setting']) {
    assert.match(llms, new RegExp(feature, 'i'), `llms.txt không nhắc tới ${feature}`)
  }
  assert.match(llms, /four public pages/i)
  assert.match(llms, /need no sign-in|do not require|without (a )?sign-in/i)
})

test('llms.txt states that there is no public REST API and no MCP server', () => {
  const llms = readPublicFile('llms.txt')
  assert.match(llms, /no public REST API/i)
  assert.match(llms, /no MCP server/i)
})

test('llms.txt does not advertise interfaces or rules that do not exist', () => {
  const llms = readPublicFile('llms.txt')
  for (const term of ['openapi', 'api key', 'developer portal', 'sandbox', '/api/mcp']) {
    assert.ok(!llms.toLowerCase().includes(term), `llms.txt không được nhắc tới ${term}`)
  }
  assert.ok(!/\b(must|should)\b/i.test(llms), 'llms.txt là mô tả, không phải bộ lệnh cho bot')
})

test('every link in llms.txt and sitemap.xml resolves to a published route or file', () => {
  const llms = readPublicFile('llms.txt')
  const sitemap = readPublicFile('sitemap.xml')
  const links = [
    ...[...llms.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]),
    ...parseXml(sitemap)
      .children.filter(child => child.name === 'url')
      .flatMap(url => url.children.filter(child => child.name === 'loc').map(child => child.text)),
  ]
  assert.ok(links.length > 0)
  for (const link of links) {
    assert.ok(link.startsWith(`${origin}/`), `${link} phải là URL tuyệt đối của production`)
    const path = new URL(link).pathname
    assert.ok(expectedLinkPaths.has(path), `${path} không phải tài nguyên công khai đã phát hành`)
    assert.ok(resolvesToRealResource(path), `${path} không trỏ tới route hay file có thật`)
  }
})

test('the discovery files are static files that the middleware never intercepts', () => {
  const matcher = String((middlewareConfig as { matcher: string[] }).matcher[0])
  const regex = new RegExp(`^${matcher}$`)
  for (const file of ['/robots.txt', '/sitemap.xml', '/llms.txt', '/og-image.png']) {
    assert.ok(filePaths.has(file), `${file} phải nằm trong staticFiles`)
    assert.equal(regex.test(file), false, `${file} phải được phục vụ như file tĩnh`)
  }
})

test('og-image.png is a real 1200x630 PNG', () => {
  const path = join(publicDir, 'og-image.png')
  assert.ok(existsSync(path), 'public/og-image.png chưa tồn tại')
  const bytes = readFileSync(path)
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  assert.equal(bytes.subarray(12, 16).toString('ascii'), 'IHDR')
  assert.equal(bytes.readUInt32BE(16), 1200)
  assert.equal(bytes.readUInt32BE(20), 630)
})
