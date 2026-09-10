<script lang="ts" setup>
import { useGetCateServiceTreeQuery } from '@/services/api/community-cate.api'
import { findCatePath, formatCatePathLabel } from '@/utils/community-cate-tree'

const props = defineProps<{
  cateCode?: string
  cateName?: string
}>()

const { data } = useGetCateServiceTreeQuery()

const label = computed(() => {
  const pathLabel = formatCatePathLabel(findCatePath(data.value?.data, props.cateCode))
  return pathLabel || props.cateName || '-'
})
</script>

<template>
  <div class="max-w-[200px] truncate text-sm text-muted-foreground">
    {{ label }}
  </div>
</template>
