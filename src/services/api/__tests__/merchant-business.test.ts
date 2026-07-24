import { describe, expect, it } from 'vitest'

import {
  merchantBusinessKey,
  merchantModulePath,
} from '@/services/api/merchant-business-urls'

describe('merchant-business api builders', () => {
  describe('merchantModulePath', () => {
    it('should build /merchant/{module}/{merchantId} prefix', () => {
      expect(merchantModulePath('cate', 'M1')).toBe('/merchant/cate/M1')
      expect(merchantModulePath('goods', 'M1')).toBe('/merchant/goods/M1')
      expect(merchantModulePath('faq', 'M1')).toBe('/merchant/faq/M1')
      expect(merchantModulePath('activity', 'M1')).toBe('/merchant/activity/M1')
      expect(merchantModulePath('order', 'M1')).toBe('/merchant/order/M1')
    })
  })

  describe('merchantBusinessKey', () => {
    it('should produce queryKey with merchantBusiness prefix + module + merchantId', () => {
      expect(merchantBusinessKey('cate', 'M1')).toEqual(['merchantBusiness', 'cate', 'M1'])
    })

    it('should append extra key segments', () => {
      expect(merchantBusinessKey('goods', 'M1', 'detail', 'G1')).toEqual([
        'merchantBusiness',
        'goods',
        'M1',
        'detail',
        'G1',
      ])
    })

    it('should keep merchantId in key so switching merchant re-fetches', () => {
      const keyA = merchantBusinessKey('order', 'M1', 'page')
      const keyB = merchantBusinessKey('order', 'M2', 'page')

      expect(keyA).not.toEqual(keyB)
      expect(keyA[2]).toBe('M1')
      expect(keyB[2]).toBe('M2')
    })
  })
})
