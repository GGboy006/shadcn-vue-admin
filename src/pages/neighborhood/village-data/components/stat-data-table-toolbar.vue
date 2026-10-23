<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'
import { computed } from 'vue'

import type { VillageStat } from '@/services/api/neighborhood-governance.api'

import { DataTableViewOptions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  table: Table<VillageStat>
  search?: string
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'reset': []
}>()

const isFiltered = computed(() => !!props.search)

const searchModel = computed({
  get: () => props.search ?? '',
  set: value => emit('update:search', value),
})
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-1 items-center space-x-2">
      <Input
        v-model="searchModel"
        placeholder="搜索名称、数值"
        class="h-8 w-[150px] lg:w-[250px]"
      />
      <Button
        v-if="isFiltered"
        variant="ghost"
        class="h-8 px-2 lg:px-3"
        @click="emit('reset')"
      >
        重置
        <XIcon class="ml-2 size-4" />
      </Button>
    </div>
    <DataTableViewOptions :table="table" />
  </div>
</template>
