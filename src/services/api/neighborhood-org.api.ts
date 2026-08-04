import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 性别:0=未知,1=男,2=女 */
export type Gender = 0 | 1 | 2
/** 状态:1=启用,2=禁用 */
export type OrgStatus = 1 | 2
/** 用户状态:1=正常,2=禁用 */
export type UserStatus = 1 | 2

/**
 * 居委会信息 VO(对接文档附录 A.1 BusinessMerchantVO)。
 *
 * 与商户/物业共用同一结构,居委会不使用的字段(营业时间/配送费等)保留为可选,
 * 后端可能返回空值。serveResidents/members 为居委会特有维护字段。
 */
export interface INeighborhoodOrgVO {
  /** 居委会本地 ID */
  merchantId: string
  /** 管理员昵称 */
  nickname: string
  /** 登录手机号 */
  phone: string
  /** 头像 URL */
  avatar: string
  /** 性别:0=未知,1=男,2=女 */
  gender: Gender
  /** 用户状态:1=正常,2=禁用 */
  userStatus: UserStatus
  /** 最后登录时间 */
  lastLoginTime?: string
  /** 城市居委会标识 */
  merchantCode: string
  /** 居委会名称 */
  merchantName: string
  /** 分类标识 */
  categoryCode?: string
  /** Logo */
  logo: string
  /** 门头照(居委会通常为空) */
  poster?: string
  /** 轮播图(居委会通常为空) */
  bannerImages: string[]
  /** 其他图 */
  otherImages: string[]
  /** 所属站长用户 ID */
  stationUserId?: number
  /** 类型:固定 6=居委会 */
  type: 6
  /** 联系人 */
  contactName: string
  /** 联系电话 */
  contactPhone: string
  /** 详细地址 */
  address: string
  /** 外部链接(物业用,居委会可忽略) */
  externalUrl?: string
  /** 签约日期 */
  signDate: string
  /** 签约费用 */
  signFee: number
  /** 营业状态(居委会可忽略) */
  businessStatus?: number
  /** 营业时间(居委会可忽略) */
  businessHours?: string
  /** 起送金额(商户用) */
  minDeliveryAmount?: number
  /** 配送费(商户用) */
  deliveryFee?: number
  /** 结算周期(商户用) */
  settlementCycle?: number
  /** 状态:1=启用,2=禁用 */
  status: OrgStatus
  /** 服务居民数(居委会特有) */
  serveResidents: number
  /** 成员数(居委会特有) */
  members: number
  /** 简介 */
  remark: string
}

/**
 * 更新居委会信息 DTO(对接文档 1.4/2.2 BusinessOrgUpdateDTO)。
 *
 * orgCode 由后端按当前登录用户自动注入,前端不传。
 * password 为空字符串时不修改密码。
 */
export interface INeighborhoodOrgUpdateDTO {
  /** 居委会本地 ID(必须等于当前登录用户所属居委会 ID) */
  merchantId: string
  /** 昵称 */
  nickname?: string
  /** 登录手机号 */
  phone?: string
  /** 登录密码;空则不修改 */
  password?: string
  /** 头像 */
  avatar?: string
  /** 性别 */
  gender?: Gender
  /** 居委会名称 */
  merchantName?: string
  /** Logo */
  logo?: string
  /** 联系人 */
  contactName?: string
  /** 联系电话 */
  contactPhone?: string
  /** 详细地址 */
  address?: string
  /** 签约日期 */
  signDate?: string
  /** 签约费用 */
  signFee?: number
  /** 服务居民数 */
  serveResidents?: number
  /** 成员数 */
  members?: number
  /** 简介(同步城市 instruction) */
  remark?: string
  /** 1=启用,2=禁用 */
  status?: OrgStatus
}

/** 居委会信息响应 */
export type INeighborhoodOrgInfoResponse = IResponse<INeighborhoodOrgVO>

// ==================== API 封装 ====================

/**
 * 查看当前登录居委会管理员绑定的居委会信息(对接文档 2.1)。
 *
 * orgCode 由后端按 token 自动解析,前端无需传参。
 */
export function useGetMyOrgInfoQuery() {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodOrgInfoResponse, Error>({
    queryKey: ['neighborhood', 'myOrgInfo'],
    queryFn: async () => await apiFetch<INeighborhoodOrgInfoResponse>('/neighborhood/myOrgInfo', {
      method: 'get',
    }),
    retry: false,
  })
}

/**
 * 更新当前居委会信息(对接文档 2.2)。
 *
 * merchantId 必须与当前登录用户绑定的居委会一致,否则无权限。
 */
export function useUpdateMyOrgInfoMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodOrgUpdateDTO>({
    mutationKey: ['updateMyOrgInfo'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/updateMyOrgInfo', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhood', 'myOrgInfo'] })
    },
  })
}
