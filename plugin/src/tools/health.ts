import { defineTool } from '@deepseek-ai/dsh-tools'
import { collectHealth, type LibraryHealth } from '../library/health.ts'
import { initLibrary } from '../library/init.ts'

/** 健康检查工具核心：先确保库就绪（幂等，缺失的桶会补建），再如实报告。 */
export function ensureHealth(root: string): LibraryHealth {
  initLibrary(root)
  return collectHealth(root)
}

/** 模型可见的自然语言投影（canonical 值的补充说明，不替代结构化返回）。 */
function renderHealthText(health: LibraryHealth): string {
  const lines = health.buckets.map(bucket =>
    `- ${bucket.label}（${bucket.id}）：${bucket.exists ? `${bucket.entries} 条` : '目录缺失'} — ${bucket.path}`)
  return [
    `存念知识库：${health.root}`,
    `状态：${health.initialized ? '已初始化' : '未初始化'}`,
    `条目总数：${health.totalEntries}`,
    ...lines,
  ].join('\n')
}

export function createHealthTool(root: string) {
  return defineTool({
    name: 'cunnian__health',
    description: '存念知识库健康检查：返回库根、五个顶层目录（收件箱/项目/领域/资源/存档）状态与条目计数；库根不存在时自动初始化。',
    parameters: {},
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          root: { type: 'string', required: true },
          initialized: { type: 'boolean', required: true },
          totalEntries: { type: 'integer', required: true },
          buckets: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: { type: 'string', required: true },
                label: { type: 'string', required: true },
                path: { type: 'string', required: true },
                exists: { type: 'boolean', required: true },
                entries: { type: 'integer', required: true },
              },
            },
          },
        },
      } as const,
      render: (_args, value) => [{ type: 'text', text: renderHealthText(value) }],
    },
    async execute(): Promise<LibraryHealth> {
      return ensureHealth(root)
    },
  })
}
