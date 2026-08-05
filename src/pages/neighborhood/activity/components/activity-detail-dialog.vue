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
  activityAuditStatusConfig,
  activityEnableStatusConfig,
  activityRecommendConfig,
  useGetActivityDetailQuery,
} from '@/services/api/neighborhood-activity.api'

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

const { data, isLoading } = useGetActivityDetailQuery(uniqueCode, isOpen)

const detail = computed(() => data.value?.data)

const auditConfig = computed(() => {
  const status = detail.value?.status
  if (status === undefined || status === null)
    return undefined
  return activityAuditStatusConfig[status]
})

const enableConfig = computed(() => {
  const status = detail.value?.isEnable
  if (status === undefined || status === null)
    return undefined
  return activityEnableStatusConfig[status]
})

const recommendConfig = computed(() => {
  const status = detail.value?.isRecommend
  if (status === undefined || status === null)
    return undefined
  return activityRecommendConfig[status]
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle class="text-base">
          活动详情
        </DialogTitle>
        <DialogDescription class="sr-only">
          查看居委会活动的完整内容
        </DialogDescription>
      </DialogHeader>

      <div class="max-h-[70vh] overflow-y-auto">
        <div v-if="isLoading" class="space-y-4">
          <Skeleton class="h-6 w-2/3" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-24 w-full" />
        </div>

        <div v-else-if="detail" class="space-y-6">
          <!-- 封面图 -->
          <img v-if="detail.poster" :src="detail.poster" alt="封面" class="h-40 w-full rounded-lg border object-cover">

          <!-- 标题与状态 -->
          <div class="space-y-2">
            <h2 class="text-lg font-semibold">
              {{ detail.name }}
            </h2>
            <div class="flex flex-wrap items-center gap-2">
              <Badge v-if="auditConfig" :variant="auditConfig.variant">
                {{ auditConfig.label }}
              </Badge>
              <Badge v-if="enableConfig" :variant="enableConfig.variant">
                {{ enableConfig.label }}
              </Badge>
              <Badge v-if="recommendConfig" :variant="recommendConfig.variant">
                {{ recommendConfig.label }}
              </Badge>
            </div>
          </div>

          <!-- 元信息 -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span class="text-muted-foreground">分类:</span>
              <span>{{ detail.cateName || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">主办单位:</span>
              <span>{{ detail.sponsorName || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">开始时间:</span>
              <span>{{ detail.startTime || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">结束时间:</span>
              <span>{{ detail.endTime || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">收费:</span>
              <span>{{ detail.isCharge === 1 ? `¥${detail.salePrice ?? 0}` : '免费' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">地址:</span>
              <span>{{ detail.address || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">排序:</span>
              <span>{{ detail.torder ?? '-' }}</span>
            </div>
          </div>

          <!-- 简介 -->
          <div v-if="detail.describes" class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">
              简介
            </div>
            <p class="text-sm leading-relaxed">
              {{ detail.describes }}
            </p>
          </div>

          <!-- 详情图 -->
          <div v-if="detail.detailPoster" class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">
              详情图
            </div>
            <img :src="detail.detailPoster" alt="详情图" class="w-full rounded-lg border">
          </div>

          <!-- 内容(富文本渲染) -->
          <div v-if="detail.content" class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">
              内容
            </div>
            <!-- eslint-disable-next-line vue/no-v-html -- content 来自后端,为居委会管理员经富文本编辑器录入,已认证 -->
            <div class="rich-text-render text-sm leading-relaxed" v-html="detail.content" />
          </div>
        </div>

        <div v-else class="py-10 text-center text-sm text-muted-foreground">
          暂无数据
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style>
/* 富文本内容渲染样式(非 scoped:v-html 注入的 DOM 不带 scoped 属性) */
.rich-text-render p {
  margin: 0.5rem 0;
  line-height: 1.7;
}

.rich-text-render h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
}

.rich-text-render h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
}

.rich-text-render h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem;
}

.rich-text-render ul,
.rich-text-render ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.rich-text-render ul {
  list-style: disc;
}

.rich-text-render ol {
  list-style: decimal;
}

.rich-text-render ul[data-type='taskList'] {
  list-style: none;
  padding: 0;
}

.rich-text-render ul[data-type='taskList'] li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.rich-text-render img {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
  margin: 0.5rem 0;
}

.rich-text-render a {
  color: hsl(var(--primary));
  text-decoration: underline;
}

.rich-text-render blockquote {
  border-left: 3px solid hsl(var(--border));
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: hsl(var(--muted-foreground));
}
</style>
