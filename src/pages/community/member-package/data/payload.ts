import type { ICommunityMemberPackageAddDTO, ICommunityMemberPackageUpdateDTO } from '@/services/api/community-member-price.api'

import type { CommunityMemberPriceValidator } from '../validators/member-price.validator'

/** 组装套餐请求体:不带站点字段,由接口按当前站长写入 */
export function buildMemberPricePayload(
  values: CommunityMemberPriceValidator,
  packageId?: string,
): ICommunityMemberPackageAddDTO | ICommunityMemberPackageUpdateDTO {
  const remark = values.remark?.trim()
  const iosProductId = values.iosProductId?.trim()
  const payload: ICommunityMemberPackageAddDTO = {
    packageName: values.packageName.trim(),
    price: values.price as number,
    effectiveDays: values.effectiveDays as number,
    status: Number(values.status) === 2 ? 2 : 1,
    sort: values.sort ?? 0,
  }

  if (remark)
    payload.remark = remark

  if (iosProductId)
    payload.iosProductId = iosProductId

  if (packageId)
    return { packageId, ...payload }

  return payload
}
