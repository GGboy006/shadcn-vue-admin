import { describe, expect, it } from 'vitest'

import { classifyPartnerProbe, PARTNER_STAFF_DENIED } from '@/services/api/housekeeper-partner.access'

describe('classifyPartnerProbe', () => {
  it('成功打开人员列表时是合作方', () => {
    expect(classifyPartnerProbe({ code: 0, data: [] })).toBe('partner')
  })

  it('仅合作方可维护人员时是本地馆', () => {
    expect(classifyPartnerProbe({ code: 400, msg: PARTNER_STAFF_DENIED })).toBe('local')
  })

  it('其它失败不判定', () => {
    expect(classifyPartnerProbe({ code: 500, msg: '系统异常' })).toBe('unknown')
    expect(classifyPartnerProbe(null)).toBe('unknown')
  })
})
