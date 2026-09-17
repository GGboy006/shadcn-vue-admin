import { describe, expect, it } from 'vitest'

import type { CommunityMemberPriceValidator } from '../../validators/member-price.validator'

import { buildMemberPricePayload } from '../payload'

const values: CommunityMemberPriceValidator = {
  packageId: undefined,
  packageName: ' 年卡 ',
  price: 0,
  effectiveDays: 365,
  iosProductId: '  com.demo.year  ',
  remark: ' 试用 ',
  status: 1,
  sort: 2,
}

describe('buildMemberPricePayload', () => {
  it('does not send station or partner fields', () => {
    const payload = buildMemberPricePayload(values)
    expect(payload).not.toHaveProperty('partnerId')
    expect(payload).not.toHaveProperty('regionCode')
    expect(payload).not.toHaveProperty('stationId')
    expect(payload).not.toHaveProperty('stationCode')
    expect(payload).not.toHaveProperty('stationRegionCode')
    expect(payload.packageName).toBe('年卡')
    expect(payload.price).toBe(0)
    expect(payload.iosProductId).toBe('com.demo.year')
    expect(payload.remark).toBe('试用')
    expect(payload.status).toBe(1)
    expect(payload.sort).toBe(2)
  })

  it('coerces string status 2 to disabled', () => {
    const payload = buildMemberPricePayload({ ...values, status: '2' as unknown as number })
    expect(payload.status).toBe(2)
  })

  it('includes packageId only when updating', () => {
    const created = buildMemberPricePayload(values)
    expect(created).not.toHaveProperty('packageId')

    const updated = buildMemberPricePayload(values, 'abc')
    expect(updated).toMatchObject({ packageId: 'abc', packageName: '年卡' })
  })

  it('omits empty iosProductId', () => {
    const payload = buildMemberPricePayload({ ...values, iosProductId: '  ' })
    expect(payload).not.toHaveProperty('iosProductId')
  })
})
