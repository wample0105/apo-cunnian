import fs from 'node:fs'
import { BUCKETS, bucketDir, type BucketId } from './paths.ts'

export interface InitResult {
  root: string
  created: BucketId[]
  existing: BucketId[]
}

/** 初始化知识库：确保库根与五个顶层目录存在；幂等，不动目录里的任何内容。 */
export function initLibrary(root: string): InitResult {
  fs.mkdirSync(root, { recursive: true })
  const created: BucketId[] = []
  const existing: BucketId[] = []
  for (const { id } of BUCKETS) {
    const dir = bucketDir(root, id)
    if (fs.existsSync(dir)) {
      existing.push(id)
      continue
    }
    fs.mkdirSync(dir)
    created.push(id)
  }
  return { root, created, existing }
}
