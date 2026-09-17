import { describe, expect, it } from 'vitest'

import {
  canAuditResidentVerify,
  normalizeResident,
  residentMemberStatusText,
} from '../resident.model'

describe('resident helpers', () => {
  it('stringifies snowflake ids', () => {
    const resident = normalizeResident({
      residentId: 12 as unknown as string,
      userId: 34 as unknown as string,
      stationId: 56 as unknown as string,
    })
    expect(resident.residentId).toBe('12')
    expect(resident.userId).toBe('34')
    expect(resident.stationId).toBe('56')
  })

  it('maps memberStatus including expired', () => {
    expect(residentMemberStatusText(0)).toBe('非会员')
    expect(residentMemberStatusText(1)).toBe('有效')
    expect(residentMemberStatusText(2)).toBe('已过期')
    expect(residentMemberStatusText(3)).toBe('已取消')
    expect(residentMemberStatusText()).toBe('-')
  })

  it('allows audit only while verifying', () => {
    expect(canAuditResidentVerify({ verifyStatus: 1 })).toBe(true)
    expect(canAuditResidentVerify({ verifyStatus: 0 })).toBe(false)
    expect(canAuditResidentVerify({ verifyStatus: 2 })).toBe(false)
    expect(canAuditResidentVerify({ verifyStatus: 3 })).toBe(false)
  })
})
