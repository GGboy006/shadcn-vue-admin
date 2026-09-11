import { describe, expect, it } from 'vitest'

import { isMerchantBusinessUser, isPropertyUser, MERCHANT_BUSINESS_USER_TYPES, PROPERTY_ACCESS_DENIED, UserType } from '@/constants/user-type'

describe('user-type', () => {
  it('userType 枚举值正确', () => {
    expect(UserType.stationMaster).toBe(3)
    expect(UserType.merchant).toBe(4)
    expect(UserType.property).toBe(5)
    expect(UserType.committee).toBe(6)
  })

  it('mERCHANT_BUSINESS_USER_TYPES 含 4/6,不含物业 5', () => {
    expect([...MERCHANT_BUSINESS_USER_TYPES].sort()).toEqual([4, 6])
  })

  it('物业拒绝文案已定义', () => {
    expect(PROPERTY_ACCESS_DENIED).toContain('物业')
  })

  describe('isPropertyUser', () => {
    it('仅物业(5)返回 true', () => {
      expect(isPropertyUser(5)).toBe(true)
      expect(isPropertyUser(4)).toBe(false)
      expect(isPropertyUser(6)).toBe(false)
      expect(isPropertyUser(undefined)).toBe(false)
    })
  })

  describe('isMerchantBusinessUser', () => {
    it.each([4, 6])('商户后台用户类型 %i 返回 true', (userType) => {
      expect(isMerchantBusinessUser(userType)).toBe(true)
    })

    it('站长(3)与物业(5)返回 false', () => {
      expect(isMerchantBusinessUser(3)).toBe(false)
      expect(isMerchantBusinessUser(5)).toBe(false)
    })

    it('其他值返回 false', () => {
      expect(isMerchantBusinessUser(0)).toBe(false)
      expect(isMerchantBusinessUser(7)).toBe(false)
    })

    it('undefined/null 返回 false', () => {
      expect(isMerchantBusinessUser(undefined)).toBe(false)
      expect(isMerchantBusinessUser(null)).toBe(false)
    })
  })
})
