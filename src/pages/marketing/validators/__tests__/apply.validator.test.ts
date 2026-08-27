import { describe, expect, it } from 'vitest'

import { applyValidator } from '@/pages/marketing/validators/apply.validator'

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    communityName: '桂园小区',
    contactName: '张三',
    phone: '13800138000',
    identity: 'property',
    remark: '',
    ...overrides,
  }
}

describe('applyValidator', () => {
  it('完整填写通过', () => {
    const result = applyValidator.safeParse(validPayload())
    expect(result.success).toBe(true)
  })

  it('手机号格式错误', () => {
    const result = applyValidator.safeParse(validPayload({ phone: '12345' }))
    expect(result.success).toBe(false)
  })

  it('小区名称为空不通过', () => {
    const result = applyValidator.safeParse(validPayload({ communityName: '  ' }))
    expect(result.success).toBe(false)
  })

  it('未选身份不通过', () => {
    const result = applyValidator.safeParse(validPayload({ identity: '' }))
    expect(result.success).toBe(false)
  })
})
