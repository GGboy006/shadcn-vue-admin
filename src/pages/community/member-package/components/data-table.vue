<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { ICommunityMemberPrice } from '@/services/api/community-member-price.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './data-table-toolbar.vue'

const props = defineProps<DataTableProps<ICommunityMemberPrice>>()

const table = useGenerateVueTable<ICommunityMemberPrice>(props, {
  initialColumnVisibility: {},
})
</script>

<template>
  <DataTable :columns :data :loading :table :server-pagination="serverPagination">
    <template #toolbar>
      <slot name="toolbar" :table="table">
        <DataTableToolbar :table class="w-full" />
      </slot>
    </template>
  </DataTable>
</template>
