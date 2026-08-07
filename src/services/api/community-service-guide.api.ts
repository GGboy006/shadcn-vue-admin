import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/**
 * 指南类型(对接文档 8 节 / 枚举速查)。
 * 小区服务版 type 枚举为 1/2/3/4(与居委会 serviceGuide 不同,居委会仅 unit/address/phone 等)。
 */
export type ServiceGuideType = 1 | 2 | 3 | 4
/** 启用状态:1=启用,2=禁用 */
export type ServiceGuideEnableStatus = 1 | 2

/** 指南类型映射配置 */
export const serviceGuideTypeConfig: Record<ServiceGuideType, { label: string, variant: 'default' | 'info' | 'secondary' | 'success' }> = {
  1: { label: '主体', variant: 'default' },
  2: { label: '受理条件', variant: 'info' },
  3: { label: '申请材料', variant: 'secondary' },
  4: { label: '办理流程', variant: 'success' },
}

/** 启用状态映射配置 */
export const serviceGuideEnableStatusConfig: Record<ServiceGuideEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 分页列表查询参数(对接文档 8 节) */
export interface ICommunityServiceGuideListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 办事指南 VO(对接文档 8 节 TblCommunityServiceGuideResp) */
export interface ICommunityServiceGuide {
  /** 主键ID */
  id: number
  /** 唯一标识 */
  uniqueCode: string
  /** 父级编码 */
  parentCode?: string
  /** 标题 */
  title: string
  /** 封面图 */
  poster?: string
  /** 单位 */
  unit?: string
  /** 地址 */
  address?: string
  /** 电话 */
  phone?: string
  /** 描述 */
  describe?: string
  /** 指南类型:1=主体,2=受理条件,3=申请材料,4=办理流程 */
  type?: ServiceGuideType
  /** 区域名 */
  regionName?: string
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: ServiceGuideEnableStatus
  /** 合伙人标识(后端填充) */
  partnerId?: string
  /** 合伙人父级标识 */
  partnerPid?: string
  /** 工作时间 */
  worktime?: string
  /** 受理条件 */
  acceptanceConditions?: string
  /** 申请材料 */
  applicationMaterials?: string
  /** 办理流程 */
  handlingProcedures?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  operatorTime?: string
}

/** 新增请求体(对接文档 8 节) */
export interface ICommunityServiceGuideAddDTO {
  /** 标题 */
  title: string
  /** 父级编码 */
  parentCode?: string
  /** 指南类型:1=主体,2=受理条件,3=申请材料,4=办理流程 */
  type?: ServiceGuideType
  /** 封面图 */
  poster?: string
  /** 单位 */
  unit?: string
  /** 地址 */
  address?: string
  /** 电话 */
  phone?: string
  /** 描述 */
  describe?: string
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: ServiceGuideEnableStatus
  /** 工作时间 */
  worktime?: string
  /** 受理条件 */
  acceptanceConditions?: string
  /** 申请材料 */
  applicationMaterials?: string
  /** 办理流程 */
  handlingProcedures?: string
}

/** 更新请求体 = 新增 + uniqueCode */
export interface ICommunityServiceGuideUpdateDTO extends ICommunityServiceGuideAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type ICommunityServiceGuideListResponse = IResponse<IPageResult<ICommunityServiceGuide>>

// ==================== API 封装 ====================

/**
 * 获取办事指南分页列表(对接文档 8 节,`/community/serviceGuide/page`)。
 * 无独立 detail 接口,编辑表单用列表数据回填(列表返回即全字段)。
 */
export function useGetServiceGuidePageQuery(query: Ref<ICommunityServiceGuideListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityServiceGuideListResponse, Error>({
    queryKey: ['communityServiceGuideList', query],
    queryFn: async () => await apiFetch<ICommunityServiceGuideListResponse>('/community/serviceGuide/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 新增办事指南 */
export function useCreateServiceGuideMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityServiceGuideAddDTO>({
    mutationKey: ['createCommunityServiceGuide'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/serviceGuide', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityServiceGuideList'] })
    },
  })
}

/** 更新办事指南 */
export function useUpdateServiceGuideMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityServiceGuideUpdateDTO>({
    mutationKey: ['updateCommunityServiceGuide'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/serviceGuide', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityServiceGuideList'] })
    },
  })
}

/** 删除办事指南 */
export function useDeleteServiceGuideMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteCommunityServiceGuide'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/community/serviceGuide/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityServiceGuideList'] })
    },
  })
}
