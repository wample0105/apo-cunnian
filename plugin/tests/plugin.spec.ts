import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveRoot } from '../src/library/paths.ts'
import { ensureHealth } from '../src/tools/health.ts'
import { apply } from '../src/index.ts'
import { makeTempRoot } from './helpers.ts'

describe('resolveRoot', () => {
  it('未配置或空串回落默认 ~/cunnian；~ 展开为用户主目录；绝对路径原样保留', () => {
    const home = process.env['USERPROFILE'] ?? process.env['HOME'] ?? ''
    expect(resolveRoot(undefined)).toBe(path.join(home, 'cunnian'))
    expect(resolveRoot('')).toBe(path.join(home, 'cunnian'))
    expect(resolveRoot('~/notes')).toBe(path.join(home, 'notes'))
    expect(resolveRoot('D:\\我的库')).toBe(path.resolve('D:\\我的库'))
  })
})

describe('ensureHealth（工具核心）', () => {
  it('库根不存在时自动初始化并返回五桶状态', () => {
    const root = makeTempRoot('auto-init')
    try {
      const health = ensureHealth(root)
      expect(health.initialized).toBe(true)
      expect(health.buckets).toHaveLength(5)
      expect(fs.existsSync(path.join(root, 'inbox'))).toBe(true)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  it('库根在而桶缺失时补建缺失的桶', () => {
    const root = makeTempRoot('repair-bucket')
    try {
      fs.mkdirSync(path.join(root, 'inbox'), { recursive: true })
      const health = ensureHealth(root)
      expect(health.initialized).toBe(true)
      expect(fs.existsSync(path.join(root, 'archives'))).toBe(true)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  it('已入库条目计数出现在健康结果里', () => {
    const root = makeTempRoot('with-entries')
    try {
      fs.mkdirSync(path.join(root, 'inbox'), { recursive: true })
      fs.writeFileSync(path.join(root, 'inbox', 'a.md'), '---\nid: a\ncreated: "2026-10-03T00:00:00.000Z"\nsource: manual\ntouches: 0\n---\n', 'utf8')
      const health = ensureHealth(root)
      expect(health.totalEntries).toBe(1)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('apply（插件装配）', () => {
  it('初始化知识库并把健康检查工具注册进宿主', () => {
    const root = makeTempRoot('apply')
    try {
      const registered: Array<{ name: string }> = []
      const ctx = {
        tools: { register: (tool: { name: string }) => registered.push(tool) },
      }

      apply(ctx as never, { root })
      expect(fs.existsSync(path.join(root, 'archives'))).toBe(true)
      expect(registered).toHaveLength(1)
      expect(registered[0]?.name).toBe('cunnian__health')
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})
