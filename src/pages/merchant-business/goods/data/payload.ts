import type { IGoodsAddReq, IGoodsResp, IGoodsUpdateReq } from '@/services/api/merchant-business.api'

import type { GoodsFormValues } from './schema'

/** 商品表单可选字段列表(除 name/cateCode/cateName 外) */
const OPTIONAL_FIELDS = [
  'poster',
  'detailPoster',
  'describes',
  'content',
  'salePrice',
  'torder',
  'isRecommend',
  'freeFlag',
] as const

/**
 * 构建商品新增/更新请求体。
 *
 * - 有 goodsCode -> 更新(IGoodsUpdateReq)
 * - 无 goodsCode -> 新增(IGoodsAddReq)
 * - name / cateCode / cateName 为空抛错(后端三者必填)
 * - 可选字段为 undefined 时不写入
 */
export function buildGoodsPayload(values: GoodsFormValues, goodsCode?: string): IGoodsAddReq | IGoodsUpdateReq {
  if (!values.name.trim()) {
    throw new Error('商品名称不能为空')
  }
  if (!values.cateCode?.trim()) {
    throw new Error('分类标识不能为空')
  }
  if (!values.cateName?.trim()) {
    throw new Error('分类名称不能为空')
  }

  const base: Record<string, unknown> = {
    name: values.name,
    cateCode: values.cateCode,
    cateName: values.cateName,
  }
  OPTIONAL_FIELDS.forEach((field) => {
    const value = values[field]
    if (value !== undefined) {
      base[field] = value
    }
  })

  if (goodsCode) {
    return { goodsCode, ...base } as unknown as IGoodsUpdateReq
  }
  return base as unknown as IGoodsAddReq
}

/**
 * 将商品详情(文档 3.2 IGoodsResp)映射为表单初始值,用于编辑回显。
 *
 * 注意:列表 VO(3.1)缺 cateCode/detailPoster/torder 等字段,
 * 故编辑时必须拉详情接口取完整数据,不能用列表行回显。
 *
 * detail 接口未返回 freeFlag,默认 0(收费)。
 */
export function mapGoodsDetailToFormValues(detail: IGoodsResp): GoodsFormValues {
  return {
    name: detail.name ?? '',
    cateCode: detail.cateCode ?? '',
    cateName: detail.cateName ?? '',
    poster: detail.poster,
    detailPoster: detail.detailPoster,
    describes: detail.describes,
    content: detail.content,
    salePrice: detail.salePrice,
    torder: detail.torder,
    isRecommend: detail.isRecommend,
    freeFlag: 0,
  }
}
