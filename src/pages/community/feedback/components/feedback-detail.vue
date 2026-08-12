<script setup lang="ts">
import { computed } from 'vue'

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/prop-ui/modal'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  feedbackStatusConfig,
  feedbackTypeConfig,
  useGetFeedbackDetailQuery,
} from '@/services/api/feedback.api'

const props = defineProps<{
  open: boolean
  feedbackId: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const feedbackId = computed(() => props.feedbackId)

const { data, isLoading } = useGetFeedbackDetailQuery(feedbackId, isOpen)

const detail = computed(() => data.value?.data)

const typeConfig = computed(() => {
  const type = detail.value?.feedbackType
  if (type === undefined || type === null)
    return undefined
  return feedbackTypeConfig[type]
})

const statusConfig = computed(() => {
  const status = detail.value?.status
  if (status === undefined || status === null)
    return undefined
  return feedbackStatusConfig[status]
})

const images = computed(() => detail.value?.images ?? [])
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-2xl">
      <ModalHeader>
        <ModalTitle class="text-base">
          意见反馈详情
        </ModalTitle>
        <ModalDescription class="sr-only">
          查看意见反馈的完整内容
        </ModalDescription>
      </ModalHeader>

      <div class="max-h-[70vh] overflow-y-auto">
        <div v-if="isLoading" class="space-y-4">
          <Skeleton class="h-6 w-2/3" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-1/2" />
        </div>

        <div v-else-if="detail" class="space-y-6">
          <!-- 反馈人 + 状态 -->
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <h2 class="text-lg font-semibold">
                {{ detail.userName || '匿名用户' }}
              </h2>
              <span v-if="detail.userPhone" class="text-sm text-muted-foreground">
                {{ detail.userPhone }}
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <Badge v-if="typeConfig" :variant="typeConfig.variant">
                {{ typeConfig.label }}
              </Badge>
              <Badge v-if="statusConfig" :variant="statusConfig.variant">
                {{ statusConfig.label }}
              </Badge>
            </div>
          </div>

          <!-- 反馈内容 -->
          <div v-if="detail.content" class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">
              反馈内容
            </div>
            <p class="text-sm leading-relaxed whitespace-pre-wrap">
              {{ detail.content }}
            </p>
          </div>

          <!-- 图片 -->
          <div v-if="images.length" class="space-y-2">
            <div class="text-sm font-medium text-muted-foreground">
              图片({{ images.length }})
            </div>
            <div class="grid grid-cols-4 gap-2">
              <a
                v-for="(img, idx) in images"
                :key="idx"
                :href="img"
                target="_blank"
                rel="noopener noreferrer"
                class="block overflow-hidden rounded-md border aspect-square"
              >
                <img :src="img" :alt="`图片${idx + 1}`" class="size-full object-cover transition hover:scale-105">
              </a>
            </div>
          </div>

          <!-- 回复信息 -->
          <div v-if="detail.replyContent" class="space-y-1 rounded-md bg-muted p-3">
            <div class="text-sm font-medium text-muted-foreground">
              回复内容
            </div>
            <p class="text-sm leading-relaxed whitespace-pre-wrap">
              {{ detail.replyContent }}
            </p>
            <div v-if="detail.replyTime" class="text-xs text-muted-foreground">
              回复时间：{{ detail.replyTime }}
            </div>
          </div>

          <!-- 元信息 -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span class="text-muted-foreground">反馈时间：</span>
              <span>{{ detail.createTime || '-' }}</span>
            </div>
            <div v-if="detail.handleTime">
              <span class="text-muted-foreground">处理时间：</span>
              <span>{{ detail.handleTime }}</span>
            </div>
            <div v-if="detail.remark">
              <span class="text-muted-foreground">备注：</span>
              <span>{{ detail.remark }}</span>
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
