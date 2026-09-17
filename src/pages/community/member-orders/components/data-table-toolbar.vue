<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'

import type { ICommunityMemberOrder } from '@/services/api/community-member-order.api'

import { DataTableViewOptions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { memberOrderPayStatusFilterOptions, memberOrderStatusFilterOptions } from '@/services/api/community-member-order.api'

interface DataTableToolbarProps {
  table: Table<ICommunityMemberOrder>
  search?: string
  payStatusFilter?: string
  statusFilter?: string
}

const props = withDefaults(defineProps<DataTableToolbarProps>(), {
  payStatusFilter: 'all',
  statusFilter: 'all',
})

const emits = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:payStatusFilter', value: string): void
  (e: 'update:statusFilter', value: string): void
  (e: 'reset'): void
}>()

const isFiltered = computed(() =>
  !!props.search
  || props.payStatusFilter !== 'all'
  || props.statusFilter !== 'all',
)

const searchModel = computed({
  get: () => props.search ?? '',
  set: val => emits('update:search', val),
})

const payStatusModel = computed({
  get: () => props.payStatusFilter,
  set: val => emits('update:payStatusFilter', val || 'all'),
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
        placeholder="订单号 / 套餐名称"
        class="h-8 w-[180px] lg:w-[240px]"
      />

      <Select v-model="payStatusModel">
        <SelectTrigger class="h-8 w-[120px]">
          <SelectValue placeholder="支付状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            全部支付
          </SelectItem>
          <SelectItem
            v-for="item in memberOrderPayStatusFilterOptions"
            :key="item.value"
            :value="String(item.value)"
          >
            {{ item.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="statusModel">
        <SelectTrigger class="h-8 w-[140px]">
          <SelectValue placeholder="订单状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            全部状态
          </SelectItem>
          <SelectItem
            v-for="item in memberOrderStatusFilterOptions"
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
