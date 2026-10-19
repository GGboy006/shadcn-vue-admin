<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { IPartnerStaff } from '@/services/api/housekeeper-partner.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './data-table-toolbar.vue'

const props = defineProps<DataTableProps<IPartnerStaff>>()

const table = useGenerateVueTable<IPartnerStaff>(props, {
  initialColumnVisibility: {
    avatar: false,
  },
})
</script>

<template>
  <DataTable :columns :data :loading :table>
    <template #toolbar>
      <slot name="toolbar" :table="table">
        <DataTableToolbar :table class="w-full" />
      </slot>
    </template>
  </DataTable>
</template>
