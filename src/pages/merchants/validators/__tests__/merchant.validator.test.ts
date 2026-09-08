import { describe, expect, it } from 'vitest'

import { MERCHANT_TYPE_PROPERTY, merchantValidator } from '../merchant.validator'

/** 通用必填项，避免每个用例重复 */
function baseValues(overrides: Record<string, unknown> = {}) {
  return {
    merchantName: '测试名称',
    nickname: '测试昵称',
    phone: '13800000000',
    password: 'abc123',
    type: 4,
    ...overrides,
  }
}

/** 取某个字段上的报错信息 */
function errorOf(result: ReturnType<typeof merchantValidator.safeParse>, field: string) {
  if (result.success)
    return undefined
  return result.error.issues.find(i => i.path[0] === field)?.message
}

describe('merchantValidator · 物业(type=5)', () => {
  it('外部链接为空时校验失败', () => {
    const result = merchantValidator.safeParse(
      baseValues({ type: MERCHANT_TYPE_PROPERTY, externalUrl: '' }),
    )
    expect(result.success).toBe(false)
    expect(errorOf(result, 'externalUrl')).toBe('外部链接不能为空')
  })

  it('外部链接不是 http(s) 链接时校验失败', () => {
    const result = merchantValidator.safeParse(
      baseValues({ type: MERCHANT_TYPE_PROPERTY, externalUrl: 'example.com' }),
    )
    expect(result.success).toBe(false)
    expect(errorOf(result, 'externalUrl')).toContain('http://')
  })

  it('填了合法外部链接且不填商户分类时校验通过', () => {
    const result = merchantValidator.safeParse(
      baseValues({ type: MERCHANT_TYPE_PROPERTY, externalUrl: 'https://example.com/portal' }),
    )
    expect(result.success).toBe(true)
  })

  it('不因缺少商户分类而报错', () => {
    const result = merchantValidator.safeParse(
      baseValues({ type: MERCHANT_TYPE_PROPERTY, externalUrl: 'https://example.com' }),
    )
    expect(errorOf(result, 'categoryCode')).toBeUndefined()
  })
})

describe('merchantValidator · 商户(type=4)', () => {
  it('缺少商户分类时校验失败', () => {
    const result = merchantValidator.safeParse(baseValues({ categoryCode: '' }))
    expect(result.success).toBe(false)
    expect(errorOf(result, 'categoryCode')).toBe('请选择商户分类')
  })

  it('填了商户分类且不填外部链接时校验通过', () => {
    const result = merchantValidator.safeParse(baseValues({ categoryCode: 'CATE_001' }))
    expect(result.success).toBe(true)
  })
})

describe('merchantValidator · 手机号', () => {
  it('位数不足时校验失败', () => {
    const result = merchantValidator.safeParse(
      baseValues({ categoryCode: 'CATE_001', phone: '1380000' }),
    )
    expect(result.success).toBe(false)
    expect(errorOf(result, 'phone')).toBe('请输入正确的 11 位手机号')
  })

  it('超过 11 位时校验失败', () => {
    const result = merchantValidator.safeParse(
      baseValues({ categoryCode: 'CATE_001', phone: '138000000000' }),
    )
    expect(result.success).toBe(false)
  })

  it('含非数字时校验失败', () => {
    const result = merchantValidator.safeParse(
      baseValues({ categoryCode: 'CATE_001', phone: '1380000abcd' }),
    )
    expect(result.success).toBe(false)
  })

  it('非法号段时校验失败', () => {
    const result = merchantValidator.safeParse(
      baseValues({ categoryCode: 'CATE_001', phone: '12800000000' }),
    )
    expect(result.success).toBe(false)
  })

  it('合法 11 位手机号校验通过', () => {
    const result = merchantValidator.safeParse(
      baseValues({ categoryCode: 'CATE_001', phone: '13812345678' }),
    )
    expect(result.success).toBe(true)
  })
})

describe('merchantValidator · 密码', () => {
  it('新建（无 merchantId）未填密码时校验失败', () => {
    const result = merchantValidator.safeParse(
      baseValues({ categoryCode: 'CATE_001', password: '' }),
    )
    expect(result.success).toBe(false)
    expect(errorOf(result, 'password')).toBe('新建时密码不能为空')
  })

  it('编辑（有 merchantId）可以不填密码', () => {
    const result = merchantValidator.safeParse(
      baseValues({ categoryCode: 'CATE_001', password: '', merchantId: 'M1001' }),
    )
    expect(result.success).toBe(true)
  })
})
