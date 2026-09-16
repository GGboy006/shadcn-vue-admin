import type { ICommunityMemberPriceAddDTO, ICommunityMemberPriceUpdateDTO } from '@/services/api/community-member-price.api'

import type { CommunityMemberPriceValidator } from '../validators/member-price.validator'

/** 组装套餐请求体:不带 partnerId / regionCode,由接口自行捕捉 */
export function buildMemberPricePayload(
  values: CommunityMemberPriceValidator,
  uniqueCode?: string,
): ICommunityMemberPriceAddDTO | ICommunityMemberPriceUpdateDTO {
  const remark = values.remark?.trim()
  const payload: ICommunityMemberPriceAddDTO = {
    priceName: values.priceName.trim(),
    price: values.price as number,
    effectiveDays: values.effectiveDays as number,
    isEnable: values.isEnable === 2 ? 2 : 1,
    sortOrder: values.sortOrder ?? 0,
  }

  if (remark)
    payload.remark = remark

  if (uniqueCode)
    return { uniqueCode, ...payload }

  return payload
}
