import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { countEntries, createEntry, EntryError, readEntry, updateEntry } from '../src/library/entry.ts'
import { makeTempLibrary } from './helpers.ts'

describe('createEntry', () => {
  it('落入收件箱，frontmatter 四字段（id/created/source/touches）完整可读回，正文原样保留', () => {
    const root = makeTempLibrary('create')
    try {
      const entry = createEntry(root, { title: '关于第二大脑的灵感', body: '原话一字不改。\n第二行。' })
      expect(entry.path).toContain(path.join('inbox'))
      expect(fs.existsSync(entry.path)).toBe(true)

      const read = readEntry(entry.path)
      expect(read.frontmatter.id).toBe(entry.frontmatter.id)
      expect(read.frontmatter.id).toMatch(/^[0-9a-f-]{36}$/)
      expect(Number.isNaN(Date.parse(read.frontmatter.created))).toBe(false)
      expect(read.frontmatter.source).toBe('manual')
      expect(read.frontmatter.touches).toBe(0)
      expect(read.frontmatter.title).toBe('关于第二大脑的灵感')
      expect(read.body).toBe('原话一字不改。\n第二行。')
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  it('指定桶与来源：条目落到对应目录，source 如实记录', () => {
    const root = makeTempLibrary('bucket')
    try {
      const entry = createEntry(root, { bucket: 'projects', title: 'demo', body: 'x', source: 'feishu' })
      expect(entry.path).toContain(path.join('projects'))
      expect(readEntry(entry.path).frontmatter.source).toBe('feishu')
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  it('中文标题进文件名；同一标题两条条目不互相覆盖', () => {
    const root = makeTempLibrary('slug')
    try {
      const a = createEntry(root, { title: '飞书上的产品想法', body: '一' })
      const b = createEntry(root, { title: '飞书上的产品想法', body: '二' })
      expect(a.path).not.toBe(b.path)
      expect(path.basename(a.path)).toMatch(/飞书上的产品想法/)
      expect(readEntry(a.path).body).toBe('一')
      expect(readEntry(b.path).body).toBe('二')
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('readEntry 校验（异常路径）', () => {
  it('frontmatter 不是合法 YAML 时报 EntryError 并带文件路径', () => {
    const root = makeTempLibrary('badyaml')
    try {
      const file = path.join(root, 'inbox', 'broken.md')
      fs.writeFileSync(file, '---\n: : : [\n---\n正文', 'utf8')
      expect(() => readEntry(file)).toThrow(EntryError)
      expect(() => readEntry(file)).toThrow(/broken\.md/)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  it('缺 id、created 不是日期、touches 为负数都判为损坏条目', () => {
    const root = makeTempLibrary('validate')
    try {
      const write = (name: string, fm: string) => {
        const file = path.join(root, 'inbox', name)
        fs.writeFileSync(file, `---\n${fm}---\n正文`, 'utf8')
        return file
      }
      const noId = write('no-id.md', 'created: "2026-10-03T00:00:00.000Z"\nsource: manual\ntouches: 0\n')
      const badCreated = write('bad-created.md', 'id: abc\ncreated: "不是日期"\nsource: manual\ntouches: 0\n')
      const negative = write('neg-touch.md', 'id: abc\ncreated: "2026-10-03T00:00:00.000Z"\nsource: manual\ntouches: -1\n')
      expect(() => readEntry(noId)).toThrow(EntryError)
      expect(() => readEntry(badCreated)).toThrow(EntryError)
      expect(() => readEntry(negative)).toThrow(EntryError)
      expect(() => readEntry(path.join(root, 'inbox', '不存在.md'))).toThrow(EntryError)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('updateEntry', () => {
  it('合并 frontmatter 补丁（如 touches+1），正文与未知字段原样保留', () => {
    const root = makeTempLibrary('update')
    try {
      const entry = createEntry(root, { title: '会被触碰的条目', body: '正文保持不变' })
      const updated = updateEntry(entry.path, { touches: 1, lastTouchedAt: '2026-10-04T00:00:00.000Z' })
      expect(updated.frontmatter.touches).toBe(1)
      expect(updated.frontmatter.lastTouchedAt).toBe('2026-10-04T00:00:00.000Z')
      expect(updated.frontmatter.id).toBe(entry.frontmatter.id)
      expect(updated.body).toBe('正文保持不变')

      const reread = readEntry(entry.path)
      expect(reread.frontmatter.touches).toBe(1)
      expect(reread.body).toBe('正文保持不变')
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  it('id 是条目身份：补丁试图改写 id 时拒绝', () => {
    const root = makeTempLibrary('protect-id')
    try {
      const entry = createEntry(root, { title: '身份固定的条目', body: '' })
      expect(() => updateEntry(entry.path, { id: '另一个-id' })).toThrow(EntryError)
      expect(readEntry(entry.path).frontmatter.id).toBe(entry.frontmatter.id)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('countEntries', () => {
  it('只数 md 文件、含子目录，非 md 忽略', () => {
    const root = makeTempLibrary('count')
    try {
      createEntry(root, { title: '一', body: '' })
      createEntry(root, { title: '二', body: '' })
      fs.mkdirSync(path.join(root, 'inbox', '子目录'))
      fs.writeFileSync(path.join(root, 'inbox', '子目录', '三.md'), '---\nid: x\ncreated: "2026-10-03T00:00:00.000Z"\nsource: manual\ntouches: 0\n---\n', 'utf8')
      fs.writeFileSync(path.join(root, 'inbox', '附件.png'), 'binary', 'utf8')
      expect(countEntries(root, 'inbox')).toBe(3)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})
