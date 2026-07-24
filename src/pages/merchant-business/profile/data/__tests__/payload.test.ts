import { describe, expect, it } from 'vitest'

import type { ProfileFormValues } from '@/pages/merchant-business/profile/data/payload'
import type { IMerchantBusinessUpdateDTO } from '@/services/api/merchant-business.api'

import { buildProfilePayload } from '@/pages/merchant-business/profile/data/payload'

describe('buildProfilePayload', () => {
  const baseValues: ProfileFormValues = {
    merchantId: 'M1',
    type: 4,
    merchantName: '星巴克',
    nickname: '老王',
    phone: '13800000000',
    password: '',
    gender: 1,
    bannerImages: ['https://cdn/a.jpg', 'https://cdn/b.jpg'],
    otherImages: [],
    businessStatus: 1,
    status: 1,
  }

  it('should build payload with merchantId and type', () => {
    const result = buildProfilePayload(baseValues)

    expect(result.merchantId).toBe('M1')
    expect(result.type).toBe(4)
    expect(result.merchantName).toBe('星巴克')
    expect(result.bannerImages).toEqual(['https://cdn/a.jpg', 'https://cdn/b.jpg'])
  })

  it('should not include password when empty', () => {
    const result = buildProfilePayload({ ...baseValues, password: '' })

    expect(result).not.toHaveProperty('password')
  })

  it('should include password when non-empty', () => {
    const result = buildProfilePayload({ ...baseValues, password: 'newpass123' })

    expect(result.password).toBe('newpass123')
  })

  it('should omit undefined optional fields', () => {
    const result = buildProfilePayload({ merchantId: 'M1', type: 4 })

    expect(result).toEqual<IMerchantBusinessUpdateDTO>({ merchantId: 'M1', type: 4 })
  })

  it('should keep empty arrays for image fields', () => {
    const result = buildProfilePayload({ ...baseValues, bannerImages: [], otherImages: [] })

    expect(result.bannerImages).toEqual([])
    expect(result.otherImages).toEqual([])
  })

  it('should throw when merchantId missing', () => {
    expect(() => buildProfilePayload({ ...baseValues, merchantId: '' })).toThrow()
  })

  it('should throw when type missing', () => {
    expect(() => buildProfilePayload({ merchantId: 'M1', type: undefined as unknown as 4 })).toThrow()
  })
})
