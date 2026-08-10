import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 电话类型(对接文档 7 节 / 枚举速查):1=管理员,2=服务 */
export type CommunityPhoneType = 1 | 2
/** 启用状态:1=启用,2=禁用 */
export type CommunityPhoneEnableStatus = 1 | 2

/** 电话类型映射配置 */
export const communityPhoneTypeConfig: Record<CommunityPhoneType, { label: string, variant: 'default' | 'info' }> = {
  1: { label: '管理员', variant: 'default' },
  2: { label: '服务', variant: 'info' },
}

/** 启用状态映射配置 */
export const communityPhoneEnableStatusConfig: Record<CommunityPhoneEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 分页列表查询参数(对接文档 7 节) */
export interface ICommunityPhoneListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 社区电话 VO(对接文档 7 节 TblCommunityPhoneResp) */
export interface ICommunityPhone {
  /** 唯一标识 */
  uniqueCode: string
  /** 父级编码(顶级 parentCode=0) */
  parentCode?: string
  /** 标题 */
  title: string
  /** 图片 */
  poster?: string
  /** 电话类型:1=管理员,2=服务 */
  type?: CommunityPhoneType
  /** 区域名 */
  regionName?: string
  /** 值班电话 */
  regionPhone?: string
  /** 工作时间 */
  workTime?: string
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: CommunityPhoneEnableStatus
  /** 合伙人标识(后端填充) */
  partnerId?: string
  /** 联系人 */
  contactUser?: string
  /** 联系电话 */
  contactPhone?: string
  /** 客服微信 */
  customerServiceWeixin?: string
  /** 微信二维码 */
  wechatQrcode?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  operatorTime?: string
}

/** 新增/更新请求体(对接文档 7 节) */
export interface ICommunityPhoneSaveDTO {
  /** 唯一标识(更新必填) */
  uniqueCode?: string
  /** 标题 */
  title: string
  /** 父级编码(顶级用父级列表,parentCode=0) */
  parentCode?: string
  /** 图片 */
  poster?: string
  /** 值班电话 */
  regionPhone?: string
  /** 工作时间 */
  workTime?: string
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: CommunityPhoneEnableStatus
  /** 电话类型:1=管理员,2=服务 */
  type?: CommunityPhoneType
  /** 联系人 */
  contactUser?: string
  /** 联系电话 */
  contactPhone?: string
  /** 客服微信 */
  customerServiceWeixin?: string
  /** 微信二维码 */
  wechatQrcode?: string
}

/** 分页列表响应 */
export type ICommunityPhoneListResponse = IResponse<IPageResult<ICommunityPhone>>

// ==================== API 封装 ====================

/** 获取社区电话分页列表(对接文档 7 节,`/community/phone/page`) */
export function useGetPhonePageQuery(query: Ref<ICommunityPhoneListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityPhoneListResponse, Error>({
    queryKey: ['communityPhoneList', query],
    queryFn: async () => await apiFetch<ICommunityPhoneListResponse>('/community/phone/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 新增社区电话(对接文档 7 节,`POST /community/phone`) */
export function useCreatePhoneMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityPhoneSaveDTO>({
    mutationKey: ['createCommunityPhone'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/phone', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPhoneList'] })
    },
  })
}

/** 更新社区电话(对接文档 7 节,`PUT /community/phone`) */
export function useUpdatePhoneMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityPhoneSaveDTO>({
    mutationKey: ['updateCommunityPhone'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/phone', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPhoneList'] })
    },
  })
}

/** 删除社区电话(对接文档 7 节,`DELETE /community/phone/{uniqueCode}`) */
export function useDeletePhoneMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteCommunityPhone'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/community/phone/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPhoneList'] })
    },
  })
}
