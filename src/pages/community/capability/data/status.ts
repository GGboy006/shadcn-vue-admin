import type { CapabilityAccessType } from '@/services/api/capability.api'

export const capabilityAccessTypeLabel: Record<CapabilityAccessType, string> = {
  1: 'MCP',
  2: 'Skill',
  3: '智能体',
  4: '小程序',
  5: 'H5',
  6: '应用内页',
  7: '外部应用',
}

export const capabilityAccessTypeOptions = (Object.keys(capabilityAccessTypeLabel) as `${CapabilityAccessType}`[]).map(value => ({
  value,
  label: capabilityAccessTypeLabel[Number(value) as CapabilityAccessType],
}))

export function accessTypeBadgeVariant(accessType: CapabilityAccessType) {
  if (accessType === 1)
    return 'info'
  if (accessType === 3)
    return 'success'
  if (accessType === 4)
    return 'warning'
  if (accessType === 5)
    return 'gold'
  if (accessType === 6)
    return 'outline'
  if (accessType === 7)
    return 'default'
  return 'secondary'
}

export const capabilityCategoryFilterOptions: { value: string, label: string }[] = [
  { value: '酒旅', label: '酒旅' },
  { value: '预约', label: '预约' },
  { value: '天气', label: '天气' },
  { value: '油价', label: '油价' },
  { value: '跑腿', label: '跑腿' },
  { value: '餐饮', label: '餐饮' },
  { value: '快递', label: '快递' },
  { value: '政务政策知识', label: '政务政策知识' },
  { value: '安全法治知识', label: '安全法治知识' },
  { value: '生活科普知识', label: '生活科普知识' },
  { value: '法律服务', label: '法律服务' },
  { value: '生活便民服务', label: '生活便民服务' },
  { value: 'AI增强话术', label: 'AI增强话术' },
]

export function categoryText(category?: string) {
  return category || '-'
}
