<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'
import { computed } from 'vue'

import type { IKnowledgeArticle, IKnowledgeArticleListQuery, KnowledgePublishStatus, KnowledgeTopFlag } from '@/services/api/knowledge.api'

import { DataTableViewOptions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { knowledgePublishStatusConfig } from '@/services/api/knowledge.api'

interface DataTableToolbarProps {
  table: Table<IKnowledgeArticle>
  search?: string
  categoryIdFilter?: IKnowledgeArticleListQuery['categoryId']
  publishStatusFilter?: IKnowledgeArticleListQuery['publishStatus']
  topFlagFilter?: IKnowledgeArticleListQuery['topFlag']
  /** 分类下拉选项(由父组件传入,避免重复请求) */
  categoryOptions?: { value: number, label: string }[]
  /** 是否锁定分类(钻取页不显示分类筛选) */
  lockCategory?: boolean
}
const props = defineProps<DataTableToolbarProps>()
const emits = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:publishStatusFilter', value: IKnowledgeArticleListQuery['publishStatus']): void
  (e: 'update:topFlagFilter', value: IKnowledgeArticleListQuery['topFlag']): void
  (e: 'reset'): void
}>()

const isFiltered = computed(() =>
  !!props.search
  || props.publishStatusFilter !== undefined
  || props.topFlagFilter !== undefined,
)

const searchModel = computed({
  get: () => props.search ?? '',
  set: val => emits('update:search', val),
})

const publishStatusModel = computed({
  get: () => props.publishStatusFilter,
  set: val => emits('update:publishStatusFilter', val as IKnowledgeArticleListQuery['publishStatus']),
})

const topFlagModel = computed({
  get: () => props.topFlagFilter,
  set: val => emits('update:topFlagFilter', val as IKnowledgeArticleListQuery['topFlag']),
})

const publishStatusOptions = Object.entries(knowledgePublishStatusConfig).map(
  ([value, config]) => ({ value: Number(value) as KnowledgePublishStatus, label: config.label }),
)

const topFlagOptions: { value: KnowledgeTopFlag, label: string }[] = [
  { value: 1, label: '置顶' },
  { value: 0, label: '未置顶' },
]

function handleReset() {
  emits('reset')
}
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-1 flex-wrap items-center space-x-2">
      <Input
        v-model="searchModel"
        placeholder="标题/摘要..."
        class="h-8 w-[150px] lg:w-[220px]"
      />

      <Select v-model="publishStatusModel">
        <SelectTrigger class="h-8 w-[110px]">
          <SelectValue placeholder="发布状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="s in publishStatusOptions" :key="s.value" :value="s.value">
            {{ s.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="topFlagModel">
        <SelectTrigger class="h-8 w-[100px]">
          <SelectValue placeholder="置顶" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="t in topFlagOptions" :key="t.value" :value="t.value">
            {{ t.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        v-if="isFiltered"
        variant="ghost"
        class="h-8 px-2 lg:px-3"
        @click="handleReset"
      >
        重置
        <XIcon class="ml-2 size-4" />
      </Button>
    </div>
    <DataTableViewOptions :table="table" />
  </div>
</template>
