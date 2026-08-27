import type { ApplyValidator } from '@/pages/marketing/validators/apply.validator'

/** 官网开通申请提交体,对齐 StationApplyAddDTO */
export interface IStationApplyAddDTO {
  communityName: string
  contactName: string
  phone: string
  identity: 'property' | 'committee' | 'other'
  remark?: string
}

/** 去掉空备注,避免把空串传给后端 */
export function buildStationApplyAddDTO(values: ApplyValidator): IStationApplyAddDTO {
  const remark = values.remark?.trim()
  return {
    communityName: values.communityName,
    contactName: values.contactName,
    phone: values.phone,
    identity: values.identity,
    ...(remark ? { remark } : {}),
  }
}
