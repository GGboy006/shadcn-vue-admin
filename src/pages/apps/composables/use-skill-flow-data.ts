import { useGetSkillFlowDataQuery } from '@/services/api/skill.api'

import type { IChoiceOption, ISkillFlowDataVO, IStepField } from '../types/wizard.types'

/**
 * 将 SkillFlowDataVO 转换为 IChoiceOption
 *
 * 字段映射规则：
 * - uniqueCode → value
 * - name → label
 * - describes → desc
 * - poster → preview
 * - salePrice → 附加到 desc 中展示
 */
export function mapSkillFlowDataToOptions(data: ISkillFlowDataVO[]): IChoiceOption[] {
  return data.map((item) => {
    const desc = item.salePrice > 0
      ? `¥${item.salePrice} · ${item.describes || ''}`
      : (item.describes || '')

    return {
      value: item.uniqueCode,
      label: item.name,
      desc: desc || undefined,
      preview: item.poster || undefined,
    }
  })
}

/**
 * 判断字段是否需要动态数据（dataSourceType = 4）
 */
export function isDynamicDataSource(field: IStepField): boolean {
  return field.dataSourceType === 4
}

/**
 * 获取内置数据源配置
 */
export function getBuiltinConfig(field: IStepField): { builtin: string, limit?: number } | null {
  if (!isDynamicDataSource(field))
    return null

  const config = field.dataSourceConfig
  if (Array.isArray(config))
    return null

  return config
}

/**
 * 技能流程动态数据获取组合式函数
 *
 * 使用场景：当 field.dataSourceType = 4 时，调用此函数获取动态数据并转换为选项
 *
 * @example
 * ```typescript
 * const { options, isLoading, isError, refetch } = useSkillFlowData(field)
 * ```
 */
export function useSkillFlowData(field: IStepField | null, merchantCode?: string) {
  // 构建查询参数
  const queryParams = computed(() => {
    if (!field || !isDynamicDataSource(field))
      return null

    const builtinConfig = getBuiltinConfig(field)
    if (!builtinConfig)
      return null

    if (!merchantCode)
      return null

    return {
      dataSourceBuiltin: builtinConfig.builtin,
      merchantCode,
    }
  })

  // 调用 API
  const { data, isLoading, isError, error, refetch } = useGetSkillFlowDataQuery(queryParams)

  // 转换后的选项
  const options = computed<IChoiceOption[]>(() => {
    if (!data.value?.data)
      return []
    return mapSkillFlowDataToOptions(data.value.data)
  })

  // 原始数据
  const rawData = computed<ISkillFlowDataVO[]>(() => {
    return data.value?.data ?? []
  })

  return {
    /** 转换后的选项列表 */
    options,
    /** 原始数据 */
    rawData,
    /** 是否加载中 */
    isLoading,
    /** 是否出错 */
    isError,
    /** 错误信息 */
    error,
    /** 重新获取数据 */
    refetch,
  }
}

/**
 * 通过 builtin 字符串直接获取动态数据
 *
 * 使用场景：在 setup() 顶层预创建查询，避免在 watch/computed 中调用 composable
 */
export function useSkillFlowDataByBuiltin(builtin: Ref<string | null>, merchantCode?: Ref<string | undefined>) {
  // 构建查询参数
  const queryParams = computed(() => {
    if (!builtin.value)
      return null

    const code = merchantCode?.value
    if (!code)
      return null

    return {
      dataSourceBuiltin: builtin.value,
      merchantCode: code,
    }
  })

  // 调用 API
  const { data, isLoading, isError, error, refetch } = useGetSkillFlowDataQuery(queryParams)

  // 转换后的选项
  const options = computed<IChoiceOption[]>(() => {
    if (!data.value?.data)
      return []
    return mapSkillFlowDataToOptions(data.value.data)
  })

  return {
    options,
    isLoading,
    isError,
    error,
    refetch,
  }
}
