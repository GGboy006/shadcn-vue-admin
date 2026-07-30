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
  dynamicAuditStatusConfig,
  dynamicEnableStatusConfig,
  useGetDynamicDetailQuery,
} from '@/services/api/community-dynamic.api'

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

const { data, isLoading } = useGetDynamicDetailQuery(uniqueCode)

const detail = computed(() => data.value?.data)

const keywordList = computed(() => {
  const keywords = detail.value?.keywords
  if (!keywords)
    return []
  return keywords.split(',').map(k => k.trim()).filter(Boolean)
})

const auditConfig = computed(() => {
  const status = detail.value?.auditStatus
  if (status === undefined || status === null)
    return undefined
  return dynamicAuditStatusConfig[status]
})

const enableConfig = computed(() => {
  const status = detail.value?.isEnable
  if (status === undefined || status === null)
    return undefined
  return dynamicEnableStatusConfig[status]
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
          小区动态详情
        </SheetTitle>
        <SheetDescription class="sr-only">
          查看小区动态的完整内容
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="isLoading" class="space-y-4">
          <Skeleton class="h-40 w-full" />
          <Skeleton class="h-6 w-2/3" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-full" />
        </div>

        <div v-else-if="detail" class="space-y-6">
          <!-- 封面 -->
          <img
            v-if="detail.poster"
            :src="detail.poster"
            alt="封面"
            class="w-full max-h-60 rounded-lg object-cover border"
          >

          <!-- 标题与状态 -->
          <div class="space-y-2">
            <h2 class="text-lg font-semibold">
              {{ detail.title }}
            </h2>
            <div class="flex flex-wrap items-center gap-2">
              <Badge v-if="auditConfig" :variant="auditConfig.variant">
                {{ auditConfig.label }}
              </Badge>
              <Badge v-if="enableConfig" :variant="enableConfig.variant">
                {{ enableConfig.label }}
              </Badge>
            </div>
          </div>

          <!-- 元信息 -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span class="text-muted-foreground">作者：</span>
              <span>{{ detail.userName || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">来源：</span>
              <span>{{ detail.original || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">创建时间：</span>
              <span>{{ detail.createTime || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">更新时间：</span>
              <span>{{ detail.operatorTime || '-' }}</span>
            </div>
          </div>

          <!-- 介绍 -->
          <div v-if="detail.describes" class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">
              介绍
            </div>
            <p class="text-sm leading-relaxed">
              {{ detail.describes }}
            </p>
          </div>

          <!-- 关键词 -->
          <div v-if="keywordList.length" class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">
              关键词
            </div>
            <div class="flex flex-wrap gap-2">
              <Badge v-for="kw in keywordList" :key="kw" variant="outline">
                {{ kw }}
              </Badge>
            </div>
          </div>

          <!-- 来源网址 -->
          <div v-if="detail.sourceUrl" class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">
              来源网址
            </div>
            <a
              :href="detail.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-primary underline break-all"
            >
              {{ detail.sourceUrl }}
            </a>
          </div>

          <!-- 正文内容 -->
          <div v-if="detail.content" class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">
              正文
            </div>
            <p class="text-sm leading-relaxed whitespace-pre-wrap">
              {{ detail.content }}
            </p>
          </div>

          <!-- 审核描述 -->
          <div v-if="detail.auditMsg" class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">
              审核描述
            </div>
            <p class="text-sm leading-relaxed">
              {{ detail.auditMsg }}
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
