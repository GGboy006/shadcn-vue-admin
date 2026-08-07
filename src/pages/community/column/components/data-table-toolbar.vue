<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'
import { computed } from 'vue'

import type { ICommunityColumn } from '@/services/api/community-column.api'

import { DataTableViewOptions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTableToolbarProps {
  table: Table<ICommunityColumn>
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
    <div class="flex items-center flex-1 space-x-2">
      <Input
        v-model="searchModel"
        placeholder="按名称/关键词筛选..."
        class="h-8 w-[150px] lg:w-[250px]"
      />

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
