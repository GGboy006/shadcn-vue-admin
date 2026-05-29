import type { FacetedFilterOption } from '@/components/data-table'

export const callTypes: (FacetedFilterOption & { style?: string })[] = [
  { value: '1', label: '启用', style: 'text-green-600' },
  { value: '2', label: '禁用', style: 'text-red-600' },
]

export const userTypes: FacetedFilterOption[] = [
  { value: '1', label: '商户' },
  { value: '2', label: '物业' },
]
