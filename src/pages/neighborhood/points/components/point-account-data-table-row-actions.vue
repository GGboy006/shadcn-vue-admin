<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { CoinsIcon } from '@lucide/vue'

import type { PointAccount } from '@/services/api/neighborhood-resident.api'

import { DataTableRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'

import GovFormSheet from '../../components/gov-form-sheet.vue'
import PointAdjustForm from './point-adjust-form.vue'

const props = defineProps<{ row: Row<PointAccount> }>()
const record = computed(() => props.row.original)
const isOpen = ref(false)
const rendered = useLazyMount(isOpen)
const items = computed(() => [
  { key: 'adjust', label: '加减分', icon: CoinsIcon },
])

function handleAction(key: string) {
  if (key === 'adjust')
    isOpen.value = true
}
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <GovFormSheet v-if="rendered" v-model:open="isOpen" title="加减分">
    <PointAdjustForm v-if="isOpen" :key="record.accountId" :account="record" @close="isOpen = false" />
  </GovFormSheet>
</template>
