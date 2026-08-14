<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'
import { computed } from 'vue'

import type { IResidentAiTool, IResidentAiToolCate } from '@/services/api/resident-ai-tool.api'

import { DataTableViewOptions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ToolDataTableToolbarProps {
  table: Table<IResidentAiTool>
  search?: string
  cateFilter?: string
  /** 分类下拉数据源(来自 cate/list) */
  cateOptions?: IResidentAiToolCate[]
}
const props = defineProps<ToolDataTableToolbarProps>()
const emits = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:cateFilter', value: string | undefined): void
  (e: 'reset'): void
}>()

const isFiltered = computed(() => !!props.search || !!props.cateFilter)

const searchModel = computed({
  get: () => props.search ?? '',
  set: val => emits('update:search', val),
})

const cateModel = computed({
  get: () => props.cateFilter,
  set: val => emits('update:cateFilter', val || undefined),
})

function handleReset() {
  emits('reset')
}
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-1 flex-wrap items-center space-x-2">
      <Input
        v-model="searchModel"
        placeholder="按工具名称筛选..."
        class="h-8 w-[150px] lg:w-[220px]"
      />

      <Select v-model="cateModel">
        <SelectTrigger class="h-8 w-[160px]">
          <SelectValue placeholder="全部分类" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="cate in cateOptions ?? []"
            :key="cate.uniqueCode"
            :value="cate.uniqueCode"
          >
            {{ cate.name }}
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
