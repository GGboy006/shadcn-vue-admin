import { useQuery } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'

/** 技能类型：1=扣子(Coze)，2=Agent，3=AI AgentSkill */
export type SkillType = '1' | '2' | '3'

/** 输入类型：1=文本，2=图片，3=音频，4=混合 */
export type InputType = 1 | 2 | 3 | 4

/** 技能列表查询参数 */
export interface ISkillListQuery {
  /** 技能名称（模糊搜索） */
  name?: string
  /** 技能类型：1=扣子(Coze)，2=Agent，3=AI AgentSkill */
  type?: SkillType
  /** 页码 */
  pageNum: number
  /** 每页数量 */
  pageSize: number
  /** 是否查询总条数 */
  searchCount?: string
  /** 排序字段集合 */
  sortItemList?: string
}

/** 技能详情 */
export interface ISkill {
  /** 技能ID */
  skillId: number
  /** 技能名称 */
  name: string
  /** 技能图标URL */
  icon: string
  /** 技能描述 */
  description: string
  /** 输入类型：1=文本，2=图片，3=音频，4=混合 */
  inputType: InputType
  /** 能力标签 */
  tags: string[]
  /** 标签颜色 */
  tagColor: string
}

/** 分页结果 */
export interface IPageResult<T> {
  /** 当前页 */
  pageNum: number
  /** 每页的数量 */
  pageSize: number
  /** 总记录数 */
  total: number
  /** 总页数 */
  pages: number
  /** 结果集 */
  list: T[]
  /** 是否为空 */
  emptyFlag: boolean
}

/** inputType 映射配置 */
export const inputTypeConfig: Record<InputType, { label: string, variant: 'info' | 'success' | 'warning' | 'gold' }> = {
  1: { label: '文本输入', variant: 'info' },
  2: { label: '图片输入', variant: 'success' },
  3: { label: '音频输入', variant: 'warning' },
  4: { label: '混合输入', variant: 'gold' },
}

/** 技能类型筛选选项 */
export const skillTypeOptions = [
  { label: '全部', value: 'all' },
  { label: '扣子(Coze)', value: '1' },
  { label: 'Agent', value: '2' },
  { label: 'AI AgentSkill', value: '3' },
] as const

/** 技能列表响应 */
export type ISkillListResponse = IResponse<IPageResult<ISkill>>

/** 获取技能列表 */
export function useGetSkillListQuery(query: Ref<ISkillListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ISkillListResponse, Error>({
    queryKey: ['skillList', query],
    queryFn: async () => await apiFetch<ISkillListResponse>('/skill/list', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}
