<script lang="ts" setup>
import { computed } from 'vue'

import type { ICommunityColumn } from '@/services/api/community-column.api'

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/prop-ui/modal'
import { Badge } from '@/components/ui/badge'
import {
  communityColumnEnableStatusConfig,
  communityColumnTypeConfig,
} from '@/services/api/community-column.api'

const props = defineProps<{
  open: boolean
  column?: ICommunityColumn
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const detail = computed(() => props.column)

const typeConfig = computed(() => {
  const type = detail.value?.type
  if (type === undefined || type === null)
    return undefined
  return communityColumnTypeConfig[type]
})

const enableConfig = computed(() => {
  const status = detail.value?.isEnable
  if (status === undefined || status === null)
    return undefined
  return communityColumnEnableStatusConfig[status]
})
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-2xl">
      <ModalHeader>
        <ModalTitle class="text-base">
          栏目详情
        </ModalTitle>
        <ModalDescription class="sr-only">
          查看小区栏目的完整内容
        </ModalDescription>
      </ModalHeader>

      <div class="space-y-6">
        <div v-if="detail" class="space-y-6">
          <!-- Logo + 名称 + 状态 -->
          <div class="flex items-start gap-4">
            <img v-if="detail.logo" :src="detail.logo" alt="Logo" class="size-16 rounded border object-cover">
            <div v-else class="flex size-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
              无
            </div>
            <div class="min-w-0 flex-1 space-y-2">
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
          </div>

          <!-- 元信息 -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span class="text-muted-foreground">小程序 appId:</span>
              <span>{{ detail.appId || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">阅览室编码:</span>
              <span>{{ detail.readingCode || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">H5 地址:</span>
              <a v-if="detail.h5Url" :href="detail.h5Url" target="_blank" rel="noopener noreferrer" class="text-primary underline break-all">
                {{ detail.h5Url }}
              </a>
              <span v-else>-</span>
            </div>
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
          </div>
        </div>

        <div v-else class="py-10 text-center text-sm text-muted-foreground">
          暂无数据
        </div>
      </div>
    </ModalContent>
  </Modal>
</template>
