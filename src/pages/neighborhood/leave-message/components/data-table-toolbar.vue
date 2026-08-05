<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'
import { computed } from 'vue'

import type { INeighborhoodLeaveMessage } from '@/services/api/neighborhood-leave-message.api'

import { DataTableViewOptions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTableToolbarProps {
  table: Table<INeighborhoodLeaveMessage>
  search?: string
}
const props = defineProps<DataTableToolbarProps>()
const emits = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'reset'): void
}>()

const isFiltered = computed(() => !!props.search)

const searchModel = computed({
  get: () => props.search ?? '',
  set: val => emits('update:search', val),
})

function handleReset() {
  emits('reset')
}
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-1 items-center space-x-2">
      <Input
        v-model="searchModel"
        placeholder="按姓名/留言内容筛选..."
        class="h-8 w-[150px] lg:w-[250px]"
      />

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
