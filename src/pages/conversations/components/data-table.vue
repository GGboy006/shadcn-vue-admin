<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { IConversation } from '@/services/api/conversation.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './data-table-toolbar.vue'

const props = defineProps<DataTableProps<IConversation>>()

const table = useGenerateVueTable<IConversation>(props)
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
