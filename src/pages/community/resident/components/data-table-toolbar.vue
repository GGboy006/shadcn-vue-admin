<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'
import { computed } from 'vue'

import type {
  IResident,
  IResidentListQuery,
  ResidentEnableStatus,
  ResidentIdentityType,
  ResidentVerifyStatus,
} from '@/services/api/resident.api'

import { DataTableViewOptions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  residentEnableStatusConfig,
  residentIdentityTypeConfig,
  residentVerifyStatusConfig,
} from '@/services/api/resident.api'

interface DataTableToolbarProps {
  table: Table<IResident>
  search?: string
  identityTypeFilter?: IResidentListQuery['identityType']
  verifyStatusFilter?: IResidentListQuery['verifyStatus']
  statusFilter?: IResidentListQuery['status']
}
const props = defineProps<DataTableToolbarProps>()
const emits = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:identityTypeFilter', value: IResidentListQuery['identityType']): void
  (e: 'update:verifyStatusFilter', value: IResidentListQuery['verifyStatus']): void
  (e: 'update:statusFilter', value: IResidentListQuery['status']): void
  (e: 'reset'): void
}>()

const isFiltered = computed(() =>
  !!props.search
  || props.identityTypeFilter !== undefined
  || props.verifyStatusFilter !== undefined
  || props.statusFilter !== undefined,
)

const searchModel = computed({
  get: () => props.search ?? '',
  set: val => emits('update:search', val),
})

const identityTypeModel = computed({
  get: () => props.identityTypeFilter,
  set: val => emits('update:identityTypeFilter', val as IResidentListQuery['identityType']),
})

const verifyStatusModel = computed({
  get: () => props.verifyStatusFilter,
  set: val => emits('update:verifyStatusFilter', val as IResidentListQuery['verifyStatus']),
})

const statusModel = computed({
  get: () => props.statusFilter,
  set: val => emits('update:statusFilter', val as IResidentListQuery['status']),
})

const identityTypeOptions = Object.entries(residentIdentityTypeConfig).map(
  ([value, config]) => ({ value: Number(value) as ResidentIdentityType, label: config.label }),
)
const verifyStatusOptions = Object.entries(residentVerifyStatusConfig).map(
  ([value, config]) => ({ value: Number(value) as ResidentVerifyStatus, label: config.label }),
)
const statusOptions = Object.entries(residentEnableStatusConfig).map(
  ([value, config]) => ({ value: Number(value) as ResidentEnableStatus, label: config.label }),
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
        placeholder="昵称/手机/门牌/楼栋..."
        class="h-8 w-[150px] lg:w-[220px]"
      />

      <Select v-model="identityTypeModel">
        <SelectTrigger class="h-8 w-[110px]">
          <SelectValue placeholder="身份类型" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="t in identityTypeOptions" :key="t.value" :value="t.value">
            {{ t.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="verifyStatusModel">
        <SelectTrigger class="h-8 w-[110px]">
          <SelectValue placeholder="认证状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="s in verifyStatusOptions" :key="s.value" :value="s.value">
            {{ s.label }}
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
