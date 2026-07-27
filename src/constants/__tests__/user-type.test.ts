import { describe, expect, it } from 'vitest'

import { isMerchantBusinessUser, MERCHANT_BUSINESS_USER_TYPES, UserType } from '@/constants/user-type'

describe('user-type', () => {
  it('userType 枚举值正确', () => {
    expect(UserType.stationMaster).toBe(3)
    expect(UserType.merchant).toBe(4)
    expect(UserType.property).toBe(5)
    expect(UserType.committee).toBe(6)
  })

  it('mERCHANT_BUSINESS_USER_TYPES 含 4/5/6', () => {
    expect([...MERCHANT_BUSINESS_USER_TYPES].sort()).toEqual([4, 5, 6])
  })

  describe('isMerchantBusinessUser', () => {
    it.each([4, 5, 6])('商户后台用户类型 %i 返回 true', (userType) => {
      expect(isMerchantBusinessUser(userType)).toBe(true)
    })

    it('站长(3)返回 false', () => {
      expect(isMerchantBusinessUser(3)).toBe(false)
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
