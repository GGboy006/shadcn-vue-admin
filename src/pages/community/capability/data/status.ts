import type { CapabilityAccessType } from '@/services/api/capability.api'

export const capabilityAccessTypeLabel: Record<CapabilityAccessType, string> = {
  1: 'MCP',
  2: 'Skill',
}

export const capabilityCategoryFilterOptions: { value: string, label: string }[] = [
  { value: 'travel', label: '酒旅' },
  { value: 'reservation', label: '预约' },
  { value: 'weather', label: '天气' },
  { value: 'oil', label: '油价' },
  { value: 'errand', label: '跑腿' },
  { value: 'food', label: '餐饮' },
  { value: 'express', label: '快递' },
]

export const capabilityCategoryLabel: Record<string, string> = Object.fromEntries(
  capabilityCategoryFilterOptions.map(item => [item.value, item.label]),
)

export function categoryText(category?: string) {
  if (!category)
    return '-'
  return capabilityCategoryLabel[category] ?? category
}
