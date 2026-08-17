import { describe, expect, it } from 'vitest'

import type { ActivityCateFormValues } from '@/pages/merchant-business/activity-cate/data/schema'
import type { IActivityCateAddReq, IActivityCateUpdateReq } from '@/services/api/merchant-business.api'

import { buildActivityCatePayload } from '@/pages/merchant-business/activity-cate/data/payload'

describe('buildActivityCatePayload', () => {
  const validValues: ActivityCateFormValues = { name: '满减活动', torder: 3 }

  describe('create', () => {
    it('should build add req with name and torder', () => {
      const result = buildActivityCatePayload(validValues, undefined)

      expect(result).toEqual<IActivityCateAddReq>({ name: '满减活动', torder: 3 })
      expect(result).not.toHaveProperty('cateCode')
    })

    it('should omit torder when undefined', () => {
      const result = buildActivityCatePayload({ name: '满减活动' }, undefined)

      expect(result).toEqual<IActivityCateAddReq>({ name: '满减活动' })
      expect(result).not.toHaveProperty('torder')
    })

    it('should throw when name empty', () => {
      expect(() => buildActivityCatePayload({ name: '' }, undefined)).toThrow()
    })
  })

  describe('update', () => {
    it('should build update req with cateCode', () => {
      const result = buildActivityCatePayload(validValues, 'CATE_001')

      expect(result).toEqual<IActivityCateUpdateReq>({ cateCode: 'CATE_001', name: '满减活动', torder: 3 })
    })

    it('should omit torder when undefined in update', () => {
      const result = buildActivityCatePayload({ name: '满减活动' }, 'CATE_001')

      expect(result).toEqual<IActivityCateUpdateReq>({ cateCode: 'CATE_001', name: '满减活动' })
      expect(result).not.toHaveProperty('torder')
    })
  })
})
