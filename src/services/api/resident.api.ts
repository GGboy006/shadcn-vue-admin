import { useQuery } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 身份类型(对接文档 5 节 / 枚举速查):1=业主,2=租户,3=家属 */
export type ResidentIdentityType = 1 | 2 | 3
/** 认证状态(对接文档 5 节 / 枚举速查):0=未认证,1=认证中,2=已认证,3=失败 */
export type ResidentVerifyStatus = 0 | 1 | 2 | 3
/** 性别(对接文档 5 节 / 枚举速查):0=未知,1=男,2=女 */
export type ResidentGender = 0 | 1 | 2
/** 启用状态:1=启用,2=禁用 */
export type ResidentEnableStatus = 1 | 2

/** 身份类型映射配置 */
export const residentIdentityTypeConfig: Record<ResidentIdentityType, { label: string, variant: 'default' | 'info' | 'secondary' }> = {
  1: { label: '业主', variant: 'default' },
  2: { label: '租户', variant: 'info' },
  3: { label: '家属', variant: 'secondary' },
}

/** 认证状态映射配置 */
export const residentVerifyStatusConfig: Record<ResidentVerifyStatus, { label: string, variant: 'secondary' | 'warning' | 'success' | 'destructive' }> = {
  0: { label: '未认证', variant: 'secondary' },
  1: { label: '认证中', variant: 'warning' },
  2: { label: '已认证', variant: 'success' },
  3: { label: '认证失败', variant: 'destructive' },
}

/** 性别映射配置 */
export const residentGenderConfig: Record<ResidentGender, { label: string }> = {
  0: { label: '未知' },
  1: { label: '男' },
  2: { label: '女' },
}

/** 居民分页列表查询参数(对接文档 5.1) */
export interface IResidentListQuery extends IPageParam {
  /** 昵称/手机/门牌/楼栋 */
  keyword?: string
  /** 身份类型:1=业主,2=租户,3=家属 */
  identityType?: ResidentIdentityType
  /** 认证状态:0=未认证,1=认证中,2=已认证,3=失败 */
  verifyStatus?: ResidentVerifyStatus
  /** 状态:1=启用,2=禁用 */
  status?: ResidentEnableStatus
  /** 楼栋号 */
  buildingNo?: string
}

/** 居民 VO(对接文档 5 节 ResidentVO) */
export interface IResident {
  /** 居民ID */
  residentId: number
  /** 用户ID */
  userId?: number
  /** 站长ID */
  stationId?: number
  /** 昵称 */
  nickname?: string
  /** 头像 */
  avatar?: string
  /** 手机 */
  phone?: string
  /** 性别:0=未知,1=男,2=女 */
  gender?: ResidentGender
  /** 楼栋号 */
  buildingNo?: string
  /** 单元号 */
  unitNo?: string
  /** 房间号 */
  roomNo?: string
  /** 门牌号 */
  doorplate?: string
  /** 面积 */
  houseArea?: number
  /** 户型 */
  houseType?: string
  /** 身份类型:1=业主,2=租户,3=家属 */
  identityType?: ResidentIdentityType
  /** 身份类型文案 */
  identityTypeLabel?: string
  /** 认证状态:0=未认证,1=认证中,2=已认证,3=失败 */
  verifyStatus?: ResidentVerifyStatus
  /** 认证状态文案 */
  verifyStatusLabel?: string
  /** 认证时间 */
  verifyTime?: string
  /** AI工具使用次数 */
  aiToolCount?: number
  /** 最近活跃时间 */
  lastActiveTime?: string
  /** 备注 */
  remark?: string
  /** 状态:1=启用,2=禁用 */
  status?: ResidentEnableStatus
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 分页列表响应 */
export type IResidentListResponse = IResponse<IPageResult<IResident>>
/** 详情响应 */
export type IResidentDetailResponse = IResponse<IResident>

// ==================== API 封装 ====================

/**
 * 获取居民分页列表(对接文档 5.1,`/resident/page`)。
 * 只读,按当前站长 stationId 隔离。
 */
export function useGetResidentPageQuery(query: Ref<IResidentListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResidentListResponse, Error>({
    queryKey: ['residentList', query],
    queryFn: async () => await apiFetch<IResidentListResponse>('/resident/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取居民详情(对接文档 5.2,`/resident/{residentId}`,只读) */
export function useGetResidentDetailQuery(residentId: Ref<number | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResidentDetailResponse, Error>({
    queryKey: ['residentDetail', residentId],
    queryFn: async () => await apiFetch<IResidentDetailResponse>(`/resident/${residentId.value}`),
    enabled: () => (enabled?.value ?? true) && residentId.value !== undefined,
    retry: false,
  })
}
