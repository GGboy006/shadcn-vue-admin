<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'

import type { IPartnerStaff } from '@/services/api/housekeeper-partner.api'

import { DataTableViewOptions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  table: Table<IPartnerStaff>
  search?: string
}>()

const emit = defineEmits<{
  'update:search': [value: string]
}>()

const searchModel = computed({
  get: () => props.search ?? '',
  set: value => emit('update:search', value),
})
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <div class="flex flex-1 items-center gap-2">
      <Input
        v-model="searchModel"
        placeholder="姓名 / 电话"
        class="h-8 w-[180px] lg:w-[240px]"
      />
      <Button
        v-if="search"
        variant="ghost"
        class="h-8 px-2 lg:px-3"
        @click="emit('update:search', '')"
      >
        重置
        <XIcon class="ml-2 size-4" />
      </Button>
    </div>
    <DataTableViewOptions :table="table" />
  </div>
</template>
