import { MoveHorizontalIcon, UnfoldHorizontalIcon } from '@lucide/vue'

export type Radius = typeof RADIUS[number]
export const RADIUS = [0, 0.25, 0.5, 0.75, 1] as const

export type ContentLayout = 'full' | 'centered'
export const CONTENT_LAYOUTS = [
  { label: 'Full', value: 'full', icon: UnfoldHorizontalIcon },
  { label: 'Centered', value: 'centered', icon: MoveHorizontalIcon },
] as const
