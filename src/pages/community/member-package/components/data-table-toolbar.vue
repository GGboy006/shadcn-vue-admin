<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'

import type { ICommunityMemberPackage } from '@/services/api/community-member-price.api'

import { DataTableViewOptions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { memberPackageStatusFilterOptions } from '@/services/api/community-member-price.api'

interface DataTableToolbarProps {
  table: Table<ICommunityMemberPackage>
  search?: string
  statusFilter?: string
}

const props = withDefaults(defineProps<DataTableToolbarProps>(), {
  statusFilter: 'all',
})

const emits = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:statusFilter', value: string): void
  (e: 'reset'): void
}>()

const isFiltered = computed(() => !!props.search || props.statusFilter !== 'all')

const searchModel = computed({
  get: () => props.search ?? '',
  set: val => emits('update:search', val),
})

const statusModel = computed({
  get: () => props.statusFilter,
  set: val => emits('update:statusFilter', val || 'all'),
})
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <div class="flex flex-1 flex-wrap items-center gap-2">
      <Input
        v-model="searchModel"
        placeholder="按套餐名称筛选..."
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
          <SelectItem
            v-for="item in memberPackageStatusFilterOptions"
            :key="item.value"
            :value="String(item.value)"
          >
            {{ item.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        v-if="isFiltered"
        variant="ghost"
        class="h-8 px-2 lg:px-3"
        @click="emits('reset')"
      >
        重置
        <XIcon class="ml-2 size-4" />
      </Button>
    </div>
    <DataTableViewOptions :table="table" />
  </div>
</template>
