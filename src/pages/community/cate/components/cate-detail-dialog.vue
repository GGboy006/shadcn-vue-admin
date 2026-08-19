<script lang="ts" setup>
import { computed } from 'vue'

import type { ICommunityCate } from '@/services/api/community-cate.api'

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/prop-ui/modal'
import { Badge } from '@/components/ui/badge'
import {
  communityCateEnableStatusConfig,
  communityCateTempTypeConfig,
  communityCateTypeConfig,
} from '@/services/api/community-cate.api'

const props = defineProps<{
  open: boolean
  cate?: ICommunityCate
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const detail = computed(() => props.cate)

const typeConfig = computed(() => {
  const type = detail.value?.type
  if (type === undefined || type === null)
    return undefined
  return communityCateTypeConfig[type]
})

const enableConfig = computed(() => {
  const status = detail.value?.isEnable
  if (status === undefined || status === null)
    return undefined
  return communityCateEnableStatusConfig[status]
})

const tempTypeConfig = computed(() => {
  const tempType = detail.value?.tempType
  if (tempType === undefined || tempType === null)
    return undefined
  return communityCateTempTypeConfig[tempType]
})
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-2xl">
      <ModalHeader>
        <ModalTitle class="text-base">
          分类详情
        </ModalTitle>
        <ModalDescription class="sr-only">
          查看小区分类的完整内容
        </ModalDescription>
      </ModalHeader>

      <div class="space-y-6">
        <div v-if="detail" class="space-y-6">
          <!-- 名称 + 状态 -->
          <div class="space-y-2">
            <h2 class="text-lg font-semibold">
              {{ detail.name }}
            </h2>
            <div class="flex flex-wrap items-center gap-2">
              <Badge v-if="typeConfig" variant="info">
                {{ typeConfig.label }}
              </Badge>
              <Badge v-if="enableConfig" :variant="enableConfig.variant">
                {{ enableConfig.label }}
              </Badge>
            </div>
          </div>

          <!-- 元信息 -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span class="text-muted-foreground">父级编码:</span>
              <span>{{ detail.parentCode || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">模板类型:</span>
              <span>{{ tempTypeConfig?.label ?? '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">排序:</span>
              <span>{{ detail.torder ?? '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">创建时间:</span>
              <span>{{ detail.createTime || '-' }}</span>
            </div>
          </div>

          <!-- 描述 -->
          <div v-if="detail.describe" class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">
              描述
            </div>
            <p class="text-sm leading-relaxed">
              {{ detail.describe }}
            </p>
          </div>
        </div>

        <div v-else class="py-10 text-center text-sm text-muted-foreground">
          暂无数据
        </div>
      </div>
    </ModalContent>
  </Modal>
</template>
