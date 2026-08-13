<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'
import { computed } from 'vue'

import type { HousekeeperEnableStatus, IHousekeeperStaff, IHousekeeperStaffListQuery } from '@/services/api/housekeeper.api'

import { DataTableViewOptions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { housekeeperEnableStatusConfig, useGetHousekeeperServiceListQuery } from '@/services/api/housekeeper.api'

interface DataTableToolbarProps {
  table: Table<IHousekeeperStaff>
  search?: string
  housekeeperIdFilter?: IHousekeeperStaffListQuery['housekeeperId']
  statusFilter?: IHousekeeperStaffListQuery['status']
}
const props = defineProps<DataTableToolbarProps>()
const emits = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:housekeeperIdFilter', value: IHousekeeperStaffListQuery['housekeeperId']): void
  (e: 'update:statusFilter', value: IHousekeeperStaffListQuery['status']): void
  (e: 'reset'): void
}>()

const isFiltered = computed(() =>
  !!props.search
  || props.housekeeperIdFilter !== undefined
  || props.statusFilter !== undefined,
)

const searchModel = computed({
  get: () => props.search ?? '',
  set: val => emits('update:search', val),
})

const housekeeperIdModel = computed({
  get: () => props.housekeeperIdFilter,
  set: val => emits('update:housekeeperIdFilter', val as IHousekeeperStaffListQuery['housekeeperId']),
})

const statusModel = computed({
  get: () => props.statusFilter,
  set: val => emits('update:statusFilter', val as IHousekeeperStaffListQuery['status']),
})

// 主体启用列表(筛选下拉用)
const { data: serviceListData } = useGetHousekeeperServiceListQuery()
const serviceOptions = computed(() =>
  (serviceListData.value?.data ?? []).map(s => ({ value: s.housekeeperId, label: s.name })),
)

const statusOptions = Object.entries(housekeeperEnableStatusConfig).map(
  ([value, config]) => ({ value: Number(value) as HousekeeperEnableStatus, label: config.label }),
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
        placeholder="人员姓名..."
        class="h-8 w-[150px] lg:w-[200px]"
      />

      <Select v-model="housekeeperIdModel">
        <SelectTrigger class="h-8 w-[140px]">
          <SelectValue placeholder="所属主体" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="s in serviceOptions" :key="s.value" :value="s.value">
            {{ s.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="statusModel">
        <SelectTrigger class="h-8 w-[110px]">
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
