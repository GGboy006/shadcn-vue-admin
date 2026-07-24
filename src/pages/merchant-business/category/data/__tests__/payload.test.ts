import { describe, expect, it } from 'vitest'

import type { CategoryFormValues } from '@/pages/merchant-business/category/data/schema'
import type { ICateAddReq, ICateUpdateReq } from '@/services/api/merchant-business.api'

import { buildCategoryPayload } from '@/pages/merchant-business/category/data/payload'

describe('buildCategoryPayload', () => {
  const validValues: CategoryFormValues = { name: '热饮', torder: 3 }

  describe('create', () => {
    it('should build add req with name and torder', () => {
      const result = buildCategoryPayload(validValues, undefined)

      expect(result).toEqual<ICateAddReq>({ name: '热饮', torder: 3 })
      expect(result).not.toHaveProperty('cateCode')
    })

    it('should omit torder when undefined', () => {
      const result = buildCategoryPayload({ name: '热饮' }, undefined)

      expect(result).toEqual<ICateAddReq>({ name: '热饮' })
      expect(result).not.toHaveProperty('torder')
    })

    it('should throw when name empty', () => {
      expect(() => buildCategoryPayload({ name: '' }, undefined)).toThrow()
    })
  })

  describe('update', () => {
    it('should build update req with cateCode', () => {
      const result = buildCategoryPayload(validValues, 'CATE_001')

      expect(result).toEqual<ICateUpdateReq>({ cateCode: 'CATE_001', name: '热饮', torder: 3 })
    })

    it('should omit torder when undefined in update', () => {
      const result = buildCategoryPayload({ name: '热饮' }, 'CATE_001')

      expect(result).toEqual<ICateUpdateReq>({ cateCode: 'CATE_001', name: '热饮' })
      expect(result).not.toHaveProperty('torder')
    })
  })
})
