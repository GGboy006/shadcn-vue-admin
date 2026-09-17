import { describe, expect, it } from 'vitest'

import { communityMemberPriceValidator } from '../member-price.validator'

function errorOf(result: ReturnType<typeof communityMemberPriceValidator.safeParse>, field: string) {
  if (result.success)
    return undefined
  return result.error.issues.find(i => i.path[0] === field)?.message
}

function baseValues(overrides: Record<string, unknown> = {}) {
  return {
    packageName: '年卡',
    price: 99,
    effectiveDays: 365,
    ...overrides,
  }
}

describe('communityMemberPriceValidator', () => {
  it('accepts a zero-price package', () => {
    const result = communityMemberPriceValidator.safeParse(baseValues({ price: 0 }))
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = communityMemberPriceValidator.safeParse(baseValues({ packageName: '  ' }))
    expect(result.success).toBe(false)
    expect(errorOf(result, 'packageName')).toBe('套餐名称不能为空')
  })

  it('rejects negative price', () => {
    const result = communityMemberPriceValidator.safeParse(baseValues({ price: -1 }))
    expect(result.success).toBe(false)
    expect(errorOf(result, 'price')).toBe('售价不能为负')
  })

  it('rejects missing effectiveDays', () => {
    const result = communityMemberPriceValidator.safeParse(baseValues({ effectiveDays: undefined }))
    expect(result.success).toBe(false)
    expect(errorOf(result, 'effectiveDays')).toBe('有效天数不能为空')
  })

  it('rejects effectiveDays below 1', () => {
    const result = communityMemberPriceValidator.safeParse(baseValues({ effectiveDays: 0 }))
    expect(result.success).toBe(false)
    expect(errorOf(result, 'effectiveDays')).toBe('有效天数至少 1 天')
  })

  it('rejects iosProductId over 100 chars', () => {
    const result = communityMemberPriceValidator.safeParse(baseValues({ iosProductId: 'x'.repeat(101) }))
    expect(result.success).toBe(false)
    expect(errorOf(result, 'iosProductId')).toBe('iOS 商品 ID 不超过 100 字')
  })
})
