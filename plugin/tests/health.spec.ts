import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createEntry } from '../src/library/entry.ts'
import { collectHealth } from '../src/library/health.ts'
import { makeTempLibrary, makeTempRoot } from './helpers.ts'

describe('collectHealth', () => {
  it('初始化后的空库：五桶齐全、计数为零、带中文名', () => {
    const root = makeTempLibrary('empty')
    try {
      const health = collectHealth(root)
      expect(health.root).toBe(root)
      expect(health.buckets.map(b => b.id)).toEqual(['inbox', 'projects', 'areas', 'resources', 'archives'])
      expect(health.buckets.map(b => b.label)).toEqual(['收件箱', '项目', '领域', '资源', '存档'])
      expect(health.buckets.every(b => b.exists && b.entries === 0)).toBe(true)
      expect(health.totalEntries).toBe(0)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  it('有条目后计数如实：分桶计数与总数一致', () => {
    const root = makeTempLibrary('counts')
    try {
      createEntry(root, { title: '收一件', body: '' })
      createEntry(root, { title: '收二件', body: '' })
      createEntry(root, { bucket: 'resources', title: '资源一件', body: '' })
      const health = collectHealth(root)
      const byId = new Map(health.buckets.map(b => [b.id, b]))
      expect(byId.get('inbox')?.entries).toBe(2)
      expect(byId.get('resources')?.entries).toBe(1)
      expect(byId.get('projects')?.entries).toBe(0)
      expect(health.totalEntries).toBe(3)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  it('库根不存在时如实报 exists:false，不擅自创建（创建是 ensure 层的职责）', () => {
    const root = makeTempRoot('missing')
    fs.rmSync(root, { recursive: true, force: true })
    const health = collectHealth(root)
    expect(health.initialized).toBe(false)
    expect(health.buckets.every(b => !b.exists)).toBe(true)
    expect(fs.existsSync(root)).toBe(false)
  })
})
