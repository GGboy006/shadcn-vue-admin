<script setup lang="ts">
import { useEnterMerchantBusiness } from '@/composables/use-enter-merchant-business'

import type { Merchant } from '../data/schema'

const props = defineProps<{
  merchant: Merchant
}>()

const { enterMerchantBusiness } = useEnterMerchantBusiness()

function handleClick() {
  enterMerchantBusiness(props.merchant.merchantId, props.merchant.merchantName)
}
</script>

<template>
  <button
    type="button"
    class="font-medium text-left text-primary hover:underline cursor-pointer"
    :title="`进入「${merchant.merchantName}」商户后台`"
    @click="handleClick"
  >
    {{ merchant.merchantName }}
  </button>
</template>
