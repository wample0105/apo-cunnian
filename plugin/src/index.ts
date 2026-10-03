import type { Context } from '@deepseek-ai/cordis'
import type { Config } from './config.ts'
import { initLibrary } from './library/init.ts'
import { resolveRoot } from './library/paths.ts'
import { createHealthTool } from './tools/health.ts'

export const name = 'cunnian'
export const inject = ['tools']
export { Config } from './config.ts'

/** 插件装配：启动即确保知识库就绪，并注册存念工具集（当前：健康检查）。 */
export function apply(ctx: Context, config: Config): void {
  const root = resolveRoot(config.root)
  initLibrary(root)
  ctx.tools.register(createHealthTool(root))
}
