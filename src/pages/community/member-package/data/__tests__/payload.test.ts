import { describe, expect, it } from 'vitest'

import type { CommunityMemberPriceValidator } from '../../validators/member-price.validator'

import { buildMemberPricePayload } from '../payload'

const values: CommunityMemberPriceValidator = {
  uniqueCode: undefined,
  priceName: ' 年卡 ',
  price: 0,
  effectiveDays: 365,
  remark: ' 试用 ',
  isEnable: 1,
  sortOrder: 2,
}

describe('buildMemberPricePayload', () => {
  it('does not send partnerId or regionCode', () => {
    const payload = buildMemberPricePayload(values)
    expect(payload).not.toHaveProperty('partnerId')
    expect(payload).not.toHaveProperty('regionCode')
    expect(payload.priceName).toBe('年卡')
    expect(payload.price).toBe(0)
    expect(payload.remark).toBe('试用')
  })

  it('includes uniqueCode only when updating', () => {
    const created = buildMemberPricePayload(values)
    expect(created).not.toHaveProperty('uniqueCode')

    const updated = buildMemberPricePayload(values, 'abc')
    expect(updated).toMatchObject({ uniqueCode: 'abc', priceName: '年卡' })
  })
})
