<script lang="ts" setup>
/**
 * 工作台 KPI 卡片,风格对齐 `/dashboard` 原有 KPI 卡片布局。
 * icon 具名插槽传入一个 svg,加载中用骨架屏占位。
 */
withDefaults(defineProps<{
  title: string
  value: string | number
  description?: string
  loading?: boolean
}>(), {
  description: '',
  loading: false,
})
</script>

<template>
  <UiCard>
    <UiCardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
      <UiCardTitle class="text-sm font-medium">
        {{ title }}
      </UiCardTitle>
      <slot name="icon" />
    </UiCardHeader>
    <UiCardContent>
      <UiSkeleton v-if="loading" class="h-8 w-20" />
      <div v-else class="text-2xl font-bold">
        {{ value }}
      </div>
      <UiSkeleton v-if="loading" class="mt-2 h-3 w-32" />
      <p v-else-if="description" class="text-xs text-muted-foreground">
        {{ description }}
      </p>
    </UiCardContent>
  </UiCard>
</template>
