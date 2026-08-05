<script lang="ts" setup>
import { computed } from 'vue'

import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  unifiedEnableStatusConfig,
  unifiedPositionConfig,
  unifiedTypeConfig,
  useGetUnifiedDetailQuery,
} from '@/services/api/neighborhood-unified.api'

const props = defineProps<{
  open: boolean
  uniqueCode?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const uniqueCode = computed(() => props.uniqueCode)

const { data, isLoading } = useGetUnifiedDetailQuery(uniqueCode, isOpen)

const detail = computed(() => data.value?.data)

const typeConfig = computed(() => {
  const type = detail.value?.type
  if (type === undefined || type === null)
    return undefined
  return unifiedTypeConfig[type]
})

const positionConfig = computed(() => {
  const pos = detail.value?.position
  if (pos === undefined || pos === null)
    return undefined
  return unifiedPositionConfig[pos]
})

const enableConfig = computed(() => {
  const status = detail.value?.isEnable
  if (status === undefined || status === null)
    return undefined
  return unifiedEnableStatusConfig[status]
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle class="text-base">
          栏目详情
        </DialogTitle>
        <DialogDescription class="sr-only">
          查看居委会栏目的完整内容
        </DialogDescription>
      </DialogHeader>

      <div class="max-h-[70vh] overflow-y-auto">
        <div v-if="isLoading" class="space-y-4">
          <Skeleton class="h-6 w-2/3" />
          <Skeleton class="h-32 w-full" />
        </div>

        <div v-else-if="detail" class="space-y-6">
          <!-- 封面 -->
          <img v-if="detail.poster" :src="detail.poster" alt="封面" class="h-40 w-full rounded-lg border object-cover">

          <!-- 标题与状态 -->
          <div class="space-y-2">
            <h2 class="text-lg font-semibold">
              {{ detail.name }}
            </h2>
            <div class="flex flex-wrap items-center gap-2">
              <Badge v-if="typeConfig" variant="info">
                {{ typeConfig.label }}
              </Badge>
              <Badge v-if="positionConfig" variant="secondary">
                {{ positionConfig.label }}
              </Badge>
              <Badge v-if="enableConfig" :variant="enableConfig.variant">
                {{ enableConfig.label }}
              </Badge>
            </div>
          </div>

          <!-- 元信息 -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span class="text-muted-foreground">跳转标识:</span>
              <span>{{ detail.resCode || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">排序:</span>
              <span>{{ detail.torder ?? '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">创建时间:</span>
              <span>{{ detail.createTime || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">更新时间:</span>
              <span>{{ detail.updateTime || '-' }}</span>
            </div>
          </div>
        </div>

        <div v-else class="py-10 text-center text-sm text-muted-foreground">
          暂无数据
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
