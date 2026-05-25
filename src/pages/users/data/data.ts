import { AwardIcon, BadgeDollarSignIcon, HandshakeIcon, ShieldIcon } from '@lucide/vue'
import { h } from 'vue'

import type { FacetedFilterOption } from '@/components/data-table'

export const callTypes: (FacetedFilterOption & { style: string })[] = [
  {
    label: '活跃',
    value: 'active',
    style: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  },
  {
    label: '停用',
    value: 'inactive',
    style: 'bg-neutral-300/40 border-neutral-300',
  },
  {
    label: '已邀请',
    value: 'invited',
    style: 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300',
  },
  {
    label: '已暂停',
    value: 'suspended',
    style: 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  },
]

export const userTypes: FacetedFilterOption[] = [
  {
    label: '超级管理员',
    value: 'superadmin',
    icon: h(BadgeDollarSignIcon),
  },
  {
    label: '管理员',
    value: 'admin',
    icon: h(HandshakeIcon),
  },
  {
    label: '经理',
    value: 'manager',
    icon: h(AwardIcon),
  },
  {
    label: '收银员',
    value: 'cashier',
    icon: h(ShieldIcon),
  },
] as const
