import { describe, expect, it } from 'vitest'

import type { FaqFormValues } from '@/pages/merchant-business/faq/data/schema'
import type { IFaqAddReq, IFaqUpdateReq } from '@/services/api/merchant-business.api'

import { buildFaqPayload } from '@/pages/merchant-business/faq/data/payload'

describe('buildFaqPayload', () => {
  const validValues: FaqFormValues = {
    categoryName: '退换政策',
    question: '支持七天无理由退货吗?',
    answer: '商品未拆封可七天无理由退货。',
    torder: 2,
    isEnable: 1,
  }

  describe('create', () => {
    it('should build add req with all fields', () => {
      const result = buildFaqPayload(validValues, undefined)

      expect(result).toEqual<IFaqAddReq>({
        categoryName: '退换政策',
        question: '支持七天无理由退货吗?',
        answer: '商品未拆封可七天无理由退货。',
        torder: 2,
        isEnable: 1,
      })
      expect(result).not.toHaveProperty('faqCode')
    })

    it('should omit optional fields when undefined', () => {
      const result = buildFaqPayload({ question: 'Q', answer: 'A' }, undefined)

      expect(result).toEqual<IFaqAddReq>({ question: 'Q', answer: 'A' })
      expect(result).not.toHaveProperty('categoryName')
      expect(result).not.toHaveProperty('torder')
      expect(result).not.toHaveProperty('isEnable')
    })

    it('should throw when question empty', () => {
      expect(() => buildFaqPayload({ question: '', answer: 'A' }, undefined)).toThrow()
    })

    it('should throw when answer empty', () => {
      expect(() => buildFaqPayload({ question: 'Q', answer: '' }, undefined)).toThrow()
    })
  })

  describe('update', () => {
    it('should build update req with faqCode', () => {
      const result = buildFaqPayload(validValues, 'FAQ_001')

      expect(result).toEqual<IFaqUpdateReq>({
        faqCode: 'FAQ_001',
        categoryName: '退换政策',
        question: '支持七天无理由退货吗?',
        answer: '商品未拆封可七天无理由退货。',
        torder: 2,
        isEnable: 1,
      })
    })
  })
})
