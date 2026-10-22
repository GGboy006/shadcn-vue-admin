<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { EnvNews } from '@/services/api/neighborhood-resident.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './env-news-data-table-toolbar.vue'

const props = defineProps<DataTableProps<EnvNews>>()

const table = useGenerateVueTable<EnvNews>(props)
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
