import { z } from 'zod'

import { optionalNumber, optionalString } from '@/validators/common'

/** 办事指南表单校验规则(对接文档 8 节,type/parentCode 前端不用) */
export const communityServiceGuideValidator = z.object({
  uniqueCode: optionalString,
  title: z.string().min(1, '标题不能为空'),
  poster: optionalString,
  unit: optionalString,
  address: optionalString,
  phone: optionalString,
  describe: optionalString,
  worktime: optionalString,
  acceptanceConditions: optionalString,
  applicationMaterials: optionalString,
  handlingProcedures: optionalString,
  isEnable: optionalNumber,
})

export type CommunityServiceGuideValidator = z.infer<typeof communityServiceGuideValidator>
