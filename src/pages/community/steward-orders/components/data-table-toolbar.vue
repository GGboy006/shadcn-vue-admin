<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'

import type { IHousekeeperOrder } from '@/services/api/housekeeper-order.api'

import { DataTableViewOptions } from '@/components/data-table'
import { DatePicker } from '@/components/prop-ui/date-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetHousekeeperServiceListQuery } from '@/services/api/housekeeper.api'

import { housekeeperOrderPayStatusFilterOptions, housekeeperOrderStatusFilterOptions } from '../data/status'

interface DataTableToolbarProps {
  table: Table<IHousekeeperOrder>
  search?: string
  orderStatusFilter?: string
  payStatusFilter?: string
  housekeeperIdFilter?: string
  dateBegin?: string
  dateEnd?: string
  showHousekeeperFilter?: boolean
}

const props = withDefaults(defineProps<DataTableToolbarProps>(), {
  orderStatusFilter: 'all',
  payStatusFilter: 'all',
  housekeeperIdFilter: 'all',
  showHousekeeperFilter: true,
})

const emits = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:orderStatusFilter', value: string): void
  (e: 'update:payStatusFilter', value: string): void
  (e: 'update:housekeeperIdFilter', value: string): void
  (e: 'update:dateBegin', value: string | undefined): void
  (e: 'update:dateEnd', value: string | undefined): void
  (e: 'reset'): void
}>()

const showHousekeeperFilter = computed(() => props.showHousekeeperFilter)
const { data: serviceListData } = useGetHousekeeperServiceListQuery(showHousekeeperFilter)
const serviceOptions = computed(() => {
  return (serviceListData.value?.data ?? []).map(item => ({ value: item.housekeeperId, label: item.name }))
})

const isFiltered = computed(() =>
  !!props.search
  || props.orderStatusFilter !== 'all'
  || props.payStatusFilter !== 'all'
  || (props.showHousekeeperFilter && props.housekeeperIdFilter !== 'all')
  || !!props.dateBegin
  || !!props.dateEnd,
)

const searchModel = computed({
  get: () => props.search ?? '',
  set: val => emits('update:search', val),
})

const orderStatusModel = computed({
  get: () => props.orderStatusFilter,
  set: val => emits('update:orderStatusFilter', val || 'all'),
})

const payStatusModel = computed({
  get: () => props.payStatusFilter,
  set: val => emits('update:payStatusFilter', val || 'all'),
})

const housekeeperIdModel = computed({
  get: () => props.housekeeperIdFilter,
  set: val => emits('update:housekeeperIdFilter', val || 'all'),
})

const dateBeginModel = computed({
  get: () => props.dateBegin,
  set: val => emits('update:dateBegin', val || undefined),
})

const dateEndModel = computed({
  get: () => props.dateEnd,
  set: val => emits('update:dateEnd', val || undefined),
})
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <div class="flex flex-1 flex-wrap items-center gap-2">
      <Input
        v-model="searchModel"
        placeholder="订单号/联系人/手机/服务/师傅"
        class="h-8 w-[180px] lg:w-[240px]"
      />

      <Select v-model="orderStatusModel">
        <SelectTrigger class="h-8 w-[120px]">
          <SelectValue placeholder="订单状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            全部状态
          </SelectItem>
          <SelectItem
            v-for="item in housekeeperOrderStatusFilterOptions"
            :key="item.value"
            :value="String(item.value)"
          >
            {{ item.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="payStatusModel">
        <SelectTrigger class="h-8 w-[120px]">
          <SelectValue placeholder="支付状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            全部支付
          </SelectItem>
          <SelectItem
            v-for="item in housekeeperOrderPayStatusFilterOptions"
            :key="item.value"
            :value="String(item.value)"
          >
            {{ item.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select v-if="showHousekeeperFilter" v-model="housekeeperIdModel">
        <SelectTrigger class="h-8 w-[140px]">
          <SelectValue placeholder="服务馆" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            全部服务馆
          </SelectItem>
          <SelectItem
            v-for="item in serviceOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <div class="w-[150px] [&_button]:h-8">
        <DatePicker v-model="dateBeginModel" placeholder="下单起" />
      </div>
      <div class="w-[150px] [&_button]:h-8">
        <DatePicker v-model="dateEndModel" placeholder="下单止" />
      </div>

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
