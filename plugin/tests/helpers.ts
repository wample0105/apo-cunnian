import fs from 'node:fs'
import path from 'node:path'
import { initLibrary } from '../src/library/init.ts'

/** 空临时根目录（不带五桶）。 */
export function makeTempRoot(prefix: string): string {
  return fs.mkdtempSync(path.join(process.env['TEMP'] ?? '/tmp', `cunnian-${prefix}-`))
}

/** 临时知识库：建根 + 五桶（走生产 initLibrary，保证目录名不漂移）。 */
export function makeTempLibrary(prefix: string): string {
  const root = makeTempRoot(prefix)
  initLibrary(root)
  return root
}
