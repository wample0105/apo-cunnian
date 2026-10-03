import fs from 'node:fs'
import { countEntries } from './entry.ts'
import { BUCKETS, bucketDir } from './paths.ts'

export interface BucketHealth {
  id: string
  label: string
  path: string
  exists: boolean
  entries: number
}

export interface LibraryHealth {
  root: string
  initialized: boolean
  buckets: BucketHealth[]
  totalEntries: number
}

/** 只读体检：如实报告五桶状态与条目计数，不创建任何目录。 */
export function collectHealth(root: string): LibraryHealth {
  const buckets = BUCKETS.map(({ id, label }) => {
    const dir = bucketDir(root, id)
    const exists = fs.existsSync(dir)
    return { id, label, path: dir, exists, entries: exists ? countEntries(root, id) : 0 }
  })
  return {
    root,
    initialized: buckets.every(bucket => bucket.exists),
    buckets,
    totalEntries: buckets.reduce((sum, bucket) => sum + bucket.entries, 0),
  }
}
