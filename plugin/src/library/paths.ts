import os from 'node:os'
import path from 'node:path'

/** 库根默认值（spec 裁定：默认 ~/cunnian，可在插件配置修改）。 */
export const DEFAULT_ROOT = '~/cunnian'

/** 收件箱 + PARA 四桶 = 五个顶层目录；磁盘目录名用 ASCII，中文名只做显示。 */
export const BUCKETS = [
  { id: 'inbox', label: '收件箱' },
  { id: 'projects', label: '项目' },
  { id: 'areas', label: '领域' },
  { id: 'resources', label: '资源' },
  { id: 'archives', label: '存档' },
] as const

export type BucketId = (typeof BUCKETS)[number]['id']

/** 解析库根：未配置回落默认值；`~` 展开为用户主目录；其余按绝对路径处理。 */
export function resolveRoot(configured?: string): string {
  const raw = configured && configured.trim() !== '' ? configured.trim() : DEFAULT_ROOT
  const expanded = raw === '~' || raw.startsWith('~/') || raw.startsWith('~\\')
    ? path.join(os.homedir(), raw.slice(1).replace(/^[\\/]/, ''))
    : raw
  return path.resolve(expanded)
}

/** 桶 id → 该桶顶层目录绝对路径。 */
export function bucketDir(root: string, bucket: BucketId): string {
  return path.join(root, bucket)
}
