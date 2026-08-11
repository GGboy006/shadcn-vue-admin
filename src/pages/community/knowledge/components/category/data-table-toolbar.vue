<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'
import { computed } from 'vue'

import type {
  IKnowledgeCategory,
  IKnowledgeCategoryListQuery,
  KnowledgeCategoryType,
  KnowledgeEnableStatus,
} from '@/services/api/knowledge.api'

import { DataTableViewOptions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  knowledgeCategoryTypeConfig,
  knowledgeEnableStatusConfig,
} from '@/services/api/knowledge.api'

interface DataTableToolbarProps {
  table: Table<IKnowledgeCategory>
  search?: string
  categoryTypeFilter?: IKnowledgeCategoryListQuery['categoryType']
  statusFilter?: IKnowledgeCategoryListQuery['status']
}
const props = defineProps<DataTableToolbarProps>()
const emits = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:categoryTypeFilter', value: IKnowledgeCategoryListQuery['categoryType']): void
  (e: 'update:statusFilter', value: IKnowledgeCategoryListQuery['status']): void
  (e: 'reset'): void
}>()

const isFiltered = computed(() =>
  !!props.search
  || props.categoryTypeFilter !== undefined
  || props.statusFilter !== undefined,
)

const searchModel = computed({
  get: () => props.search ?? '',
  set: val => emits('update:search', val),
})

const categoryTypeModel = computed({
  get: () => props.categoryTypeFilter,
  set: val => emits('update:categoryTypeFilter', val as IKnowledgeCategoryListQuery['categoryType']),
})

const statusModel = computed({
  get: () => props.statusFilter,
  set: val => emits('update:statusFilter', val as IKnowledgeCategoryListQuery['status']),
})

const categoryTypeOptions = Object.entries(knowledgeCategoryTypeConfig).map(
  ([value, config]) => ({ value: Number(value) as KnowledgeCategoryType, label: config.label }),
)
const statusOptions = Object.entries(knowledgeEnableStatusConfig).map(
  ([value, config]) => ({ value: Number(value) as KnowledgeEnableStatus, label: config.label }),
)

function handleReset() {
  emits('reset')
}
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-1 flex-wrap items-center space-x-2">
      <Input
        v-model="searchModel"
        placeholder="分类名称..."
        class="h-8 w-[150px] lg:w-[200px]"
      />

      <Select v-model="categoryTypeModel">
        <SelectTrigger class="h-8 w-[110px]">
          <SelectValue placeholder="分类类型" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="t in categoryTypeOptions" :key="t.value" :value="t.value">
            {{ t.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="statusModel">
        <SelectTrigger class="h-8 w-[100px]">
          <SelectValue placeholder="状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="s in statusOptions" :key="s.value" :value="s.value">
            {{ s.label }}
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
