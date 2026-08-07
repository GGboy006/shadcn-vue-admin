<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'
import { computed } from 'vue'

import type { ICommunityService, ICommunityServiceListQuery } from '@/services/api/community-service.api'

import { DataTableViewOptions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { communityServiceTypeConfig } from '@/services/api/community-service.api'

interface DataTableToolbarProps {
  table: Table<ICommunityService>
  search?: string
  typeFilter?: ICommunityServiceListQuery['type']
}
const props = defineProps<DataTableToolbarProps>()
const emits = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:typeFilter', value: ICommunityServiceListQuery['type']): void
  (e: 'reset'): void
}>()

const isFiltered = computed(() => !!props.search || props.typeFilter !== undefined)

const searchModel = computed({
  get: () => props.search ?? '',
  set: val => emits('update:search', val),
})

const typeModel = computed({
  get: () => props.typeFilter,
  set: val => emits('update:typeFilter', val as ICommunityServiceListQuery['type']),
})

const typeOptions = Object.entries(communityServiceTypeConfig).map(
  ([value, config]) => ({ value: Number(value) as ICommunityServiceListQuery['type'], label: config.label }),
)

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
        class="h-8 w-[150px] lg:w-[220px]"
      />

      <Select v-model="typeModel">
        <SelectTrigger class="h-8 w-[120px]">
          <SelectValue placeholder="服务类型" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="t in typeOptions" :key="t.value" :value="t.value">
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
        <XIcon class="size-4 ml-2" />
      </Button>
    </div>
    <DataTableViewOptions :table="table" />
  </div>
</template>
