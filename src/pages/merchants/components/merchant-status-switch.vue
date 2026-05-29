<script setup lang="ts">
import { LoaderIcon } from '@lucide/vue'

import { Switch } from '@/components/ui/switch'
import { useToggleMerchantStatusMutation } from '@/services/api/merchant.api'

import type { Merchant } from '../data/schema'

const props = defineProps<{
  merchant: Merchant
}>()

const { mutate, isPending } = useToggleMerchantStatusMutation()

const isEnabled = computed({
  get: () => Number(props.merchant.status) === 1,
  set: (val: boolean) => {
    const newStatus = val ? 1 : 2
    if (newStatus === Number(props.merchant.status))
      return
    mutate({ merchantId: props.merchant.merchantId, status: newStatus })
  },
})
</script>

<template>
  <div class="flex items-center gap-2">
    <Switch v-model="isEnabled" :disabled="isPending" />
    <LoaderIcon v-if="isPending" class="size-3.5 animate-spin text-muted-foreground" />
  </div>
</template>
