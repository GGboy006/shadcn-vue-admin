import type { IActivityResp } from '@/services/api/merchant-business.api'

/** 活动列表/详情行类型(文档 5.1/5.2) */
export type Activity = IActivityResp

/** 活动表单值(新增/编辑共用) */
export interface ActivityFormValues {
  /** 活动名称 */
  name: string
  /** 封面图 */
  poster?: string | null
  /** 详情图片 */
  detailPoster?: string | null
  /** 主办单位名称 */
  sponsorName?: string | null
  /** 活动分类标识 */
  cateCode?: string | null
  /** 分类名称 */
  cateName?: string | null
  /** 简介 */
  describes?: string | null
  /** 内容(Q4:textarea) */
  content?: string | null
  /** 地址 */
  address?: string | null
  /** 是否收费:1=收费,2=免费 */
  isCharge?: 1 | 2 | null
  /** 金额 */
  salePrice?: number | null
  /** 开始时间(ISO 字符串) */
  startTime: string
  /** 结束时间(ISO 字符串) */
  endTime: string
  /** 排序 */
  torder?: number | null
  /** 是否推荐:1=是,2=否 */
  isRecommend?: 1 | 2 | null
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: 1 | 2 | null
}
