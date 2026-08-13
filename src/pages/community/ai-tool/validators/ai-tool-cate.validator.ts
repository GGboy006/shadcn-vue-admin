import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/**
 * 居民AI工具分类表单校验规则(对接文档 §3.3/§3.4)
 *
 * 注意:分类 type 由后端固定为 10(AI助手),前端不提供该字段。
 */
export const residentAiToolCateValidator = z.object({
  uniqueCode: optionalString,
  name: z.string().min(1, '名称不能为空'),
  parentCode: optionalString,
  describe: optionalString,
  torder: optionalInt,
  isEnable: optionalNumber,
})

export type ResidentAiToolCateValidator = z.infer<typeof residentAiToolCateValidator>
