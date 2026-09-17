<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { BadgeCheckIcon, EyeIcon } from '@lucide/vue'

import type { RowActionItem } from '@/components/data-table'
import type { IResident } from '@/services/api/resident.api'

import { DataTableRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { canAuditResidentVerify } from '@/services/api/resident.api'

import ResidentDetailDialog from './resident-detail-dialog.vue'
import ResidentVerifyDialog from './resident-verify-dialog.vue'

const props = defineProps<{ row: Row<IResident> }>()
const resident = computed(() => props.row.original)
const isDetailOpen = ref(false)
const isDetailOpenRendered = useLazyMount(isDetailOpen)
const isVerifyOpen = ref(false)
const isVerifyOpenRendered = useLazyMount(isVerifyOpen)

const items = computed(() => {
  const actions: RowActionItem[] = [
    { key: 'view', label: '查看', icon: EyeIcon },
  ]
  if (canAuditResidentVerify(resident.value))
    actions.push({ key: 'verify', label: '审核', icon: BadgeCheckIcon })
  return actions
})

function handleAction(key: string) {
  if (key === 'view')
    isDetailOpen.value = true
  else if (key === 'verify')
    isVerifyOpen.value = true
}
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <ResidentDetailDialog
    v-if="isDetailOpenRendered"
    v-model:open="isDetailOpen"
    :resident-id="resident.residentId"
  />

  <ResidentVerifyDialog
    v-if="isVerifyOpenRendered"
    v-model:open="isVerifyOpen"
    :resident="resident"
  />
</template>
