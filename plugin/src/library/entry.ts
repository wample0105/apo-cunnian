import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { parse, stringify } from 'yaml'
import { bucketDir, type BucketId } from './paths.ts'

/**
 * 条目 frontmatter 公共契约（ADR-0001：元数据全存 YAML frontmatter，改动即迁移）。
 * created 为 RFC 3339 字符串；source 为通道来源（manual/feishu/…）；touches 只由存念工具改写（ADR-0004）。
 */
export interface EntryFrontmatter {
  id: string
  created: string
  source: string
  touches: number
  title?: string
  [key: string]: unknown
}

export interface Entry {
  path: string
  frontmatter: EntryFrontmatter
  body: string
}

export class EntryError extends Error {}

export interface CreateEntryInput {
  bucket?: BucketId
  title: string
  body?: string
  source?: string
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

/** 文件名安全化：保留字母数字与 CJK，其余折叠成连字符。 */
function slugify(title: string): string {
  const slug = title
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/^-+|-+$/g, '')
  return slug === '' ? 'entry' : slug
}

function serializeEntry(frontmatter: EntryFrontmatter, body: string): string {
  const yamlText = stringify({ ...frontmatter }, { lineWidth: 0 }).trimEnd()
  return `---\n${yamlText}\n---\n${body}`
}

function validateFrontmatter(value: unknown, file: string): EntryFrontmatter {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new EntryError(`条目 frontmatter 必须是对象：${file}`)
  }
  const fm = value as Record<string, unknown>
  if (typeof fm['id'] !== 'string' || fm['id'].trim() === '') {
    throw new EntryError(`条目缺少有效 id：${file}`)
  }
  if (typeof fm['created'] !== 'string' || Number.isNaN(Date.parse(fm['created']))) {
    throw new EntryError(`条目 created 不是合法时间：${file}`)
  }
  if (typeof fm['source'] !== 'string' || fm['source'].trim() === '') {
    throw new EntryError(`条目缺少有效 source：${file}`)
  }
  if (typeof fm['touches'] !== 'number' || !Number.isInteger(fm['touches']) || fm['touches'] < 0) {
    throw new EntryError(`条目 touches 必须是非负整数：${file}`)
  }
  return fm as EntryFrontmatter
}

/** 创建条目：默认落入收件箱；id 自动生成；正文按原文存储不做任何加工（ADR-0002）。 */
export function createEntry(root: string, input: CreateEntryInput): Entry {
  const bucket = input.bucket ?? 'inbox'
  const frontmatter: EntryFrontmatter = {
    id: randomUUID(),
    created: new Date().toISOString(),
    source: input.source ?? 'manual',
    touches: 0,
    title: input.title,
  }
  const body = input.body ?? ''
  const filename = `${slugify(input.title)}-${frontmatter.id.slice(0, 8)}.md`
  const filePath = path.join(bucketDir(root, bucket), filename)
  fs.writeFileSync(filePath, serializeEntry(frontmatter, body), 'utf8')
  return { path: filePath, frontmatter, body }
}

/** 读取条目：解析并校验 frontmatter 契约；正文逐字返回。 */
export function readEntry(filePath: string): Entry {
  let raw: string
  try {
    raw = fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    throw new EntryError(`条目不可读：${filePath}（${(error as Error).message}）`)
  }
  const match = FRONTMATTER_RE.exec(raw)
  if (!match) throw new EntryError(`条目缺少 frontmatter：${filePath}`)
  let value: unknown
  try {
    value = parse(match[1] ?? '')
  } catch (error) {
    throw new EntryError(`条目 frontmatter 不是合法 YAML：${filePath}（${(error as Error).message}）`)
  }
  const frontmatter = validateFrontmatter(value, filePath)
  const body = raw.slice(match[0].length)
  return { path: filePath, frontmatter, body }
}

/** 浅合并 frontmatter 补丁后写回；正文不动。id 是条目身份，禁止经补丁改写（ADR-0004：touches 等元数据只经存念工具变更）。 */
export function updateEntry(filePath: string, patch: Partial<EntryFrontmatter>): Entry {
  const entry = readEntry(filePath)
  if (patch['id'] !== undefined && patch['id'] !== entry.frontmatter.id) {
    throw new EntryError(`条目 id 不可改写：${filePath}`)
  }
  const merged = { ...entry.frontmatter, ...patch }
  validateFrontmatter(merged, filePath)
  fs.writeFileSync(filePath, serializeEntry(merged, entry.body), 'utf8')
  return { path: filePath, frontmatter: merged, body: entry.body }
}

/** 统计桶内条目数：递归计 .md 文件（子目录供将来的带日期存档桶使用）。
 * 口径取宽：只看扩展名不校验 frontmatter——健康检查必须对个别损坏文件保持稳健，损坏判定留给读取路径。 */
export function countEntries(root: string, bucket: BucketId): number {
  const dir = bucketDir(root, bucket)
  if (!fs.existsSync(dir)) return 0
  let count = 0
  const walk = (current: string): void => {
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      if (item.isDirectory()) walk(path.join(current, item.name))
      else if (item.isFile() && item.name.toLowerCase().endsWith('.md')) count += 1
    }
  }
  walk(dir)
  return count
}
