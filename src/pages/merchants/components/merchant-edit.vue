<script lang="ts" setup>
import { ModalDescription, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'

import type { Merchant } from '../data/schema'

import MerchantForm from './merchant-form.vue'

const props = defineProps<{
  merchant?: Merchant
}>()
defineEmits(['close'])

const merchant = computed(() => props.merchant)

const typeLabel = computed(() => {
  if (!merchant.value?.type)
    return '商户/物业'
  return merchant.value.type === 1 ? '商户' : '物业'
})

const title = computed(() => merchant.value?.merchantId ? `编辑${typeLabel.value}` : `新建${typeLabel.value}`)
const description = computed(() => merchant.value?.merchantId ? `编辑 ${merchant.value.merchantName}` : `创建新${typeLabel.value}账号`)
</script>

<template>
  <div>
    <ModalHeader>
      <ModalTitle>
        {{ title }}
      </ModalTitle>
      <ModalDescription>
        {{ description }}
      </ModalDescription>
    </ModalHeader>

    <MerchantForm :merchant="merchant" @close="$emit('close')" />
  </div>
</template>
