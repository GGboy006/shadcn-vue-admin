<script lang="ts" setup>
import type { MerchantType } from '@/services/api/merchant.api'

import { ModalDescription, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { merchantTypeConfig, useGetMerchantDetailQuery } from '@/services/api/merchant.api'

import type { Merchant } from '../data/schema'

import MerchantForm from './merchant-form.vue'

const props = defineProps<{
  merchant?: Merchant
  /** 新建时由所在页面固定的类型 */
  type?: MerchantType
}>()

defineEmits(['close'])

const isEdit = computed(() => !!props.merchant?.merchantId)

const merchantId = computed(() => props.merchant?.merchantId)

const { data: detailData, isLoading: isDetailLoading } = useGetMerchantDetailQuery(
  computed(() => merchantId.value),
)

const merchantDetail = computed(() => {
  if (!isEdit.value)
    return undefined
  return detailData.value?.data
})

const typeLabel = computed(() => {
  const type = merchantDetail.value?.type ?? props.merchant?.type ?? props.type
  if (!type)
    return '商户/物业'
  const config = merchantTypeConfig[type as MerchantType]
  return config?.label || '商户/物业'
})

const title = computed(() =>
  isEdit.value ? `编辑${typeLabel.value}` : `新建${typeLabel.value}`,
)

const description = computed(() => {
  const name = merchantDetail.value?.merchantName ?? props.merchant?.merchantName
  return isEdit.value ? `编辑 ${name}` : `创建新${typeLabel.value}账号`
})
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

    <div v-if="isEdit && isDetailLoading" class="space-y-4 py-4">
      <Skeleton class="h-10 w-full" />
      <div class="grid grid-cols-2 gap-4">
        <Skeleton class="h-10 w-full" />
        <Skeleton class="h-10 w-full" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <Skeleton class="h-10 w-full" />
        <Skeleton class="h-10 w-full" />
      </div>
    </div>

    <MerchantForm
      v-else
      :merchant="merchantDetail"
      :type="type"
      @close="$emit('close')"
    />
  </div>
</template>
