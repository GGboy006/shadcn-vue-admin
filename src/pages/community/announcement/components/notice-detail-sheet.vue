<script setup lang="ts">
import { computed } from 'vue'

import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  noticeContentTypeConfig,
  noticePublicStatusConfig,
  useGetNoticeDetailQuery,
} from '@/services/api/community-notice.api'

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

const { data, isLoading } = useGetNoticeDetailQuery(uniqueCode)

const detail = computed(() => data.value?.data)

const isLink = computed(() => detail.value?.contentType === 2)

const contentTypeConfig = computed(() => {
  const type = detail.value?.contentType
  if (type === undefined || type === null)
    return undefined
  return noticeContentTypeConfig[type]
})

const publicConfig = computed(() => {
  const status = detail.value?.isPublic
  if (status === undefined || status === null)
    return undefined
  return noticePublicStatusConfig[status]
})
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent
      side="right"
      class="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl"
    >
      <SheetHeader class="border-b px-4 py-3">
        <SheetTitle class="text-base">
          小区公告详情
        </SheetTitle>
        <SheetDescription class="sr-only">
          查看小区公告的完整内容
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="isLoading" class="space-y-4">
          <Skeleton class="h-6 w-2/3" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-1/2" />
        </div>

        <div v-else-if="detail" class="space-y-6">
          <!-- 标题与状态 -->
          <div class="space-y-2">
            <h2 class="text-lg font-semibold">
              {{ detail.title }}
            </h2>
            <div class="flex flex-wrap items-center gap-2">
              <Badge v-if="contentTypeConfig" :variant="contentTypeConfig.variant">
                {{ contentTypeConfig.label }}
              </Badge>
              <Badge v-if="publicConfig" :variant="publicConfig.variant">
                {{ publicConfig.label }}
              </Badge>
            </div>
          </div>

          <!-- 元信息 -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span class="text-muted-foreground">排序：</span>
              <span>{{ detail.torder ?? '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">创建时间：</span>
              <span>{{ detail.createTime || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">更新时间：</span>
              <span>{{ detail.updateTime || '-' }}</span>
            </div>
          </div>

          <!-- 简介 -->
          <div v-if="detail.introduction" class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">
              简介
            </div>
            <p class="text-sm leading-relaxed">
              {{ detail.introduction }}
            </p>
          </div>

          <!-- 跳转链接（链接类型） -->
          <div v-if="isLink && detail.h5Url" class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">
              跳转链接
            </div>
            <a
              :href="detail.h5Url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-primary underline break-all"
            >
              {{ detail.h5Url }}
            </a>
          </div>

          <!-- 正文内容（文本类型） -->
          <div v-if="!isLink && detail.content" class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">
              正文
            </div>
            <p class="text-sm leading-relaxed whitespace-pre-wrap">
              {{ detail.content }}
            </p>
          </div>
        </div>

        <div v-else class="py-10 text-center text-sm text-muted-foreground">
          暂无数据
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
