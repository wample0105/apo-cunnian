import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { BUCKETS, bucketDir } from '../src/library/paths.ts'
import { initLibrary } from '../src/library/init.ts'
import { makeTempRoot } from './helpers.ts'

describe('initLibrary', () => {
  it('在空根目录上创建收件箱与 PARA 四桶共五个顶层目录', () => {
    const root = makeTempRoot('fresh')
    try {
      const result = initLibrary(root)
      expect(result.created).toEqual(BUCKETS.map(b => b.id))
      expect(result.existing).toEqual([])
      for (const bucket of BUCKETS) {
        expect(fs.statSync(bucketDir(root, bucket.id)).isDirectory(), bucket.id).toBe(true)
      }
      expect(fs.readdirSync(root).sort()).toEqual(['archives', 'areas', 'inbox', 'projects', 'resources'])
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  it('重复初始化幂等：不报错、不重建已有目录', () => {
    const root = makeTempRoot('idempotent')
    try {
      initLibrary(root)
      const second = initLibrary(root)
      expect(second.created).toEqual([])
      expect(second.existing).toEqual(BUCKETS.map(b => b.id))
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  it('不动库根里已有的无关文件', () => {
    const root = makeTempRoot('keep-files')
    try {
      fs.writeFileSync(path.join(root, '随手记.md'), '用户自己的文件', 'utf8')
      initLibrary(root)
      expect(fs.readFileSync(path.join(root, '随手记.md'), 'utf8')).toBe('用户自己的文件')
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})
