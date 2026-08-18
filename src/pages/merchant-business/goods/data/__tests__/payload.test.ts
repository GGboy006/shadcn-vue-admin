import { describe, expect, it } from 'vitest'

import type { GoodsFormValues } from '@/pages/merchant-business/goods/data/schema'
import type { IGoodsAddReq, IGoodsResp, IGoodsUpdateReq } from '@/services/api/merchant-business.api'

import { buildGoodsPayload, mapGoodsDetailToFormValues } from '@/pages/merchant-business/goods/data/payload'

describe('buildGoodsPayload', () => {
  const validValues: GoodsFormValues = {
    name: '拿铁咖啡',
    cateCode: 'CATE_1',
    cateName: '热饮',
    poster: 'https://cdn/p.jpg',
    detailPoster: 'https://cdn/d.jpg',
    describes: '经典拿铁',
    content: '详细内容',
    salePrice: 18.5,
    torder: 1,
    isRecommend: 1,
    freeFlag: 0,
  }

  describe('create', () => {
    it('should build add req with all fields', () => {
      const result = buildGoodsPayload(validValues, undefined)

      expect(result).toEqual<IGoodsAddReq>({
        name: '拿铁咖啡',
        cateCode: 'CATE_1',
        cateName: '热饮',
        poster: 'https://cdn/p.jpg',
        detailPoster: 'https://cdn/d.jpg',
        describes: '经典拿铁',
        content: '详细内容',
        salePrice: 18.5,
        torder: 1,
        isRecommend: 1,
        freeFlag: 0,
      })
      expect(result).not.toHaveProperty('goodsCode')
    })

    it('should omit optional fields when undefined', () => {
      const result = buildGoodsPayload({ name: '拿铁', cateCode: 'CATE_1', cateName: '热饮' }, undefined)

      expect(result).toEqual<IGoodsAddReq>({ name: '拿铁', cateCode: 'CATE_1', cateName: '热饮' })
    })

    it('should throw when name empty', () => {
      expect(() => buildGoodsPayload({ name: '', cateCode: 'CATE_1', cateName: '热饮' }, undefined)).toThrow()
    })

    it('should throw when cateCode empty', () => {
      expect(() => buildGoodsPayload({ name: '拿铁', cateCode: '', cateName: '热饮' }, undefined)).toThrow('分类')
    })

    it('should throw when cateName empty', () => {
      expect(() => buildGoodsPayload({ name: '拿铁', cateCode: 'CATE_1', cateName: '' }, undefined)).toThrow('分类')
    })
  })

  describe('update', () => {
    it('should build update req with goodsCode', () => {
      const result = buildGoodsPayload(validValues, 'GOODS_001')

      expect(result).toEqual<IGoodsUpdateReq>({
        goodsCode: 'GOODS_001',
        ...validValues,
      })
    })
  })
})

describe('mapGoodsDetailToFormValues', () => {
  const detail: IGoodsResp = {
    uniqueCode: 'GOODS_001',
    orgCode: 'ORG_1',
    name: '拿铁咖啡',
    poster: 'https://cdn/p.jpg',
    detailPoster: 'https://cdn/d.jpg',
    cateCode: 'CATE_1',
    cateName: '热饮',
    describes: '经典拿铁',
    content: '详细内容',
    salePrice: 18.5,
    torder: 1,
    isRecommend: 1,
    isEnable: 1,
    freeFlag: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-02 10:00:00',
  }

  it('should map all detail fields to form values', () => {
    const result = mapGoodsDetailToFormValues(detail)

    expect(result).toEqual<GoodsFormValues>({
      name: '拿铁咖啡',
      cateCode: 'CATE_1',
      cateName: '热饮',
      poster: 'https://cdn/p.jpg',
      detailPoster: 'https://cdn/d.jpg',
      describes: '经典拿铁',
      content: '详细内容',
      salePrice: 18.5,
      torder: 1,
      isRecommend: 1,
      freeFlag: 1,
    })
  })

  it('should default empty strings for missing core fields', () => {
    const sparse = { ...detail, cateCode: '', cateName: '', name: '' } as IGoodsResp
    const result = mapGoodsDetailToFormValues(sparse)

    expect(result.name).toBe('')
    expect(result.cateCode).toBe('')
    expect(result.cateName).toBe('')
  })

  it('should default freeFlag to 0 when missing', () => {
    const { freeFlag: _freeFlag, ...rest } = detail
    const result = mapGoodsDetailToFormValues(rest as IGoodsResp)

    expect(result.freeFlag).toBe(0)
  })
})
