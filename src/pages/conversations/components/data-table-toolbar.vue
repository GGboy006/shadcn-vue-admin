<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'
import { computed } from 'vue'

import type { IConversation } from '@/services/api/conversation.api'

import { DataTableViewOptions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTableToolbarProps {
  table: Table<IConversation>
  search?: string
  status?: string
}

const props = defineProps<DataTableToolbarProps>()
const emits = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:status', value: string | undefined): void
  (e: 'reset'): void
}>()

const isFiltered = computed(() => !!props.search || !!props.status)

const searchModel = computed({
  get: () => props.search ?? '',
  set: val => emits('update:search', val),
})

const statusModel = computed({
  get: () => props.status ?? 'all',
  set: val => emits('update:status', val === 'all' ? undefined : val),
})

function handleReset() {
  emits('reset')
}
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center flex-1 space-x-2">
      <Input
        v-model="searchModel"
        placeholder="搜索会话标题..."
        class="h-8 w-[150px] lg:w-[250px]"
      />

      <Select v-model="statusModel">
        <SelectTrigger class="h-8 w-[120px]">
          <SelectValue placeholder="状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            全部状态
          </SelectItem>
          <SelectItem value="1">
            待介入
          </SelectItem>
          <SelectItem value="2">
            已完成
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
        <XIcon class="size-4 ml-2" />
      </Button>
    </div>

    <DataTableViewOptions :table="table" />
  </div>
</template>
