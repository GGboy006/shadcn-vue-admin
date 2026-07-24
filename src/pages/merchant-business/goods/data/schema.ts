import type { IGoodsResp, IGoodsVO } from '@/services/api/merchant-business.api'

/** 商品列表行类型(文档 3.1) */
export type Goods = IGoodsVO
/** 商品详情类型(文档 3.2) */
export type GoodsDetail = IGoodsResp

/** 商品表单值(新增/编辑共用) */
export interface GoodsFormValues {
  /** 商品名称 */
  name: string
  /** 分类标识(后端必填) */
  cateCode: string
  /** 分类名称(后端必填) */
  cateName: string
  /** 封面图 */
  poster?: string
  /** 详情图片 */
  detailPoster?: string
  /** 简介 */
  describes?: string
  /** 内容(Q4:textarea) */
  content?: string
  /** 金额 */
  salePrice?: number
  /** 排序 */
  torder?: number
  /** 是否推荐:1=是,2=否 */
  isRecommend?: 1 | 2
  /** 0=收费,1=免费 */
  freeFlag?: 0 | 1
}
