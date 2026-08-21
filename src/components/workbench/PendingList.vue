<script lang="ts" setup>
export interface PendingListItem {
  /** 展示文案 */
  label: string
  /** 数量 */
  count: number
  /** 可点击跳转的路由路径;不传则不可点击 */
  to?: string
}

withDefaults(defineProps<{
  items: PendingListItem[]
  loading?: boolean
  emptyText?: string
}>(), {
  loading: false,
  emptyText: '暂无数据',
})
</script>

<template>
  <div class="space-y-0.5">
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="flex items-center justify-between py-2.5">
        <UiSkeleton class="h-4 w-28" />
        <UiSkeleton class="h-5 w-10" />
      </div>
    </template>

    <UiEmpty v-else-if="items.length === 0" class="py-8">
      <UiEmptyDescription>{{ emptyText }}</UiEmptyDescription>
    </UiEmpty>

    <template v-else>
      <component
        :is="item.to ? 'router-link' : 'div'"
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="-mx-2 flex items-center justify-between rounded-md px-2 py-2.5 text-sm"
        :class="item.to ? 'transition-colors hover:bg-muted/50' : ''"
      >
        <span>{{ item.label }}</span>
        <UiBadge :variant="item.count > 0 ? 'default' : 'secondary'">
          {{ item.count }}
        </UiBadge>
      </component>
    </template>
  </div>
</template>
