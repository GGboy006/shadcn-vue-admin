import { describe, expect, it } from 'vitest'

import type { MerchantCategoryFormValues } from '@/pages/merchants/category/data/schema'
import type { IMerchantCategoryAddDTO, IMerchantCategoryUpdateDTO } from '@/services/api/merchant.api'

import { buildMerchantCategoryPayload } from '@/pages/merchants/category/data/payload'

describe('buildMerchantCategoryPayload', () => {
  const validValues: MerchantCategoryFormValues = { name: '餐饮', torder: 3, status: 1 }

  describe('create', () => {
    it('should build add dto with name, torder and status', () => {
      const result = buildMerchantCategoryPayload(validValues, undefined)

      expect(result).toEqual<IMerchantCategoryAddDTO>({ name: '餐饮', torder: 3, status: 1 })
      expect(result).not.toHaveProperty('uniqueCode')
    })

    it('should omit torder/status when undefined', () => {
      const result = buildMerchantCategoryPayload({ name: '餐饮' }, undefined)

      expect(result).toEqual<IMerchantCategoryAddDTO>({ name: '餐饮' })
      expect(result).not.toHaveProperty('torder')
      expect(result).not.toHaveProperty('status')
    })

    it('should throw when name empty', () => {
      expect(() => buildMerchantCategoryPayload({ name: '' }, undefined)).toThrow()
    })
  })

  describe('update', () => {
    it('should build update dto with uniqueCode', () => {
      const result = buildMerchantCategoryPayload(validValues, 'CATE_001')

      expect(result).toEqual<IMerchantCategoryUpdateDTO>({ uniqueCode: 'CATE_001', name: '餐饮', torder: 3, status: 1 })
    })

    it('should omit torder/status when undefined in update', () => {
      const result = buildMerchantCategoryPayload({ name: '餐饮' }, 'CATE_001')

      expect(result).toEqual<IMerchantCategoryUpdateDTO>({ uniqueCode: 'CATE_001', name: '餐饮' })
      expect(result).not.toHaveProperty('torder')
      expect(result).not.toHaveProperty('status')
    })
  })
})
