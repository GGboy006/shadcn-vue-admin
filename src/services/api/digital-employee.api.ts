import { useQuery } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'

// ==================== 枚举与映射 ====================

/** 数字员工类型：4-商户 5-物业 6-居委会 7-居民 */
export type EmployeeType = 4 | 5 | 6 | 7

/** AI类型：1-扣子(Coze) 2-Agent 3-AI AgentSkill */
export type EmployeeAiType = 1 | 2 | 3

/** 在线状态：0-离线 1-在线 2-忙碌 */
export type EmployeeOnlineStatus = 0 | 1 | 2

/** 在线状态映射配置 */
export const onlineStatusConfig: Record<EmployeeOnlineStatus, { label: string, variant: 'success' | 'warning' | 'secondary' }> = {
  0: { label: '离线', variant: 'secondary' },
  1: { label: '在线', variant: 'success' },
  2: { label: '忙碌', variant: 'warning' },
}

// ==================== VO 类型 ====================

/** 数字员工 VO */
export interface IDigitalEmployee {
  /** 数字员工ID */
  employeeId: number
  /** 数字员工名称 */
  employeeName: string
  /** LOGO/头像（OSS地址） */
  logo: string | null
  /** 职位头衔 */
  title: string
  /** AI等级标签 */
  levelLabel: string
  /** 部门分类ID */
  departmentId: number
  /** 部门名称 */
  departmentName: string
  /** 数字员工类型 */
  employeeType: EmployeeType
  /** 数字员工描述 */
  description: string
  /** AI类型 */
  aiType: EmployeeAiType
  /** 第三方平台标识ID */
  aiThirdId: string
  /** 能力标签 */
  tags: string[] | null
  /** 任务执行次数 */
  taskCount: number
  /** 评分 */
  scoring: number
  /** 在线状态：0-离线 1-在线 2-忙碌 */
  onlineStatus: EmployeeOnlineStatus
  /** 状态：1-启用 2-禁用 */
  status: number
}

/** 部门分类 + 已分配数字员工 VO */
export interface IDepartmentEmployee {
  /** 部门ID */
  departmentId: number
  /** 部门名称 */
  departmentName: string
  /** 部门LOGO */
  logo: string | null
  /** 部门描述 */
  description: string
  /** 排序权重 */
  sortOrder: number
  /** 该部门下已分配的数字员工数量 */
  employeeCount: number
  /** 该部门下已分配的数字员工列表 */
  employeeList: IDigitalEmployee[]
}

/** 部门分类列表响应 */
export type IDepartmentEmployeeListResponse = IResponse<IDepartmentEmployee[]>

// ==================== API 封装 ====================

/** 查询部门分类列表 + 子集已分配数字员工（含每分类数量） */
export function useGetDepartmentEmployeeListQuery() {
  const { apiFetch } = useApiFetch()

  return useQuery<IDepartmentEmployeeListResponse, Error>({
    queryKey: ['digitalEmployeeDepartmentList'],
    queryFn: async () => await apiFetch<IDepartmentEmployeeListResponse>('/digital-employee/department/list', {
      method: 'get',
    }),
    retry: false,
  })
}
