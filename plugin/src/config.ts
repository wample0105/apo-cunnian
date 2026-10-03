import Schema from '@deepseek-ai/schemastery'

export interface Config {
  /** 知识库根目录；缺省 ~/cunnian。修改后重启宿主生效。 */
  root?: string
}

export const Config: Schema<Config> = Schema.object({
  root: Schema.string().default('~/cunnian').description('知识库根目录（支持 ~ 展开），修改后重启生效'),
})
