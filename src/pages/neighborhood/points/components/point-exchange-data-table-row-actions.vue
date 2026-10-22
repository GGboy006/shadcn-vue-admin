<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { PackageCheckIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { PointExchange } from '@/services/api/neighborhood-resident.api'

import { DataTableRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { useReceivePointExchangeMutation } from '@/services/api/neighborhood-resident.api'

import GovConfirmDialog from '../../components/gov-confirm-dialog.vue'

const props = defineProps<{ row: Row<PointExchange> }>()
const record = computed(() => props.row.original)
const isOpen = ref(false)
const rendered = useLazyMount(isOpen)
const { mutate, isPending } = useReceivePointExchangeMutation()
const items = computed(() => record.value.status === 1
  ? [{ key: 'receive', label: '领取', icon: PackageCheckIcon }]
  : [])

function handleAction(key: string) {
  if (key === 'receive')
    isOpen.value = true
}

function confirmReceive() {
  mutate(record.value.exchangeId, {
    onSuccess: () => {
      toast.success('已领取')
      isOpen.value = false
    },
    onError: (err: Error) => toast.error(err.message || '领取失败'),
  })
}
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <GovConfirmDialog
    v-if="rendered"
    v-model:open="isOpen"
    :title="`确认 ${record.userName || '居民'} 已领取 ${record.name || '商品'}`"
    description="领取后不能改回待领取。"
    confirm-text="确认领取"
    :pending="isPending"
    @confirm="confirmReceive"
  />
</template>
