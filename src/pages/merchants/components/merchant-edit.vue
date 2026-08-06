<script lang="ts" setup>
import type { MerchantType } from '@/services/api/merchant.api'

import { FormSheet, FormSheetContent, FormSheetDescription, FormSheetHeader, FormSheetTitle } from '@/components/prop-ui/form-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { merchantTypeConfig, useGetMerchantDetailQuery } from '@/services/api/merchant.api'

import type { Merchant } from '../data/schema'

import MerchantForm from './merchant-form.vue'

const props = defineProps<{
  open: boolean
  merchant?: Merchant
  /** 新建时由所在页面固定的类型 */
  type?: MerchantType
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

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

function handleClose() {
  emit('close')
  emit('update:open', false)
}
</script>

<template>
  <FormSheet v-model:open="isOpen">
    <FormSheetContent>
      <FormSheetHeader class="border-b px-4 py-3">
        <FormSheetTitle class="text-base">
          {{ title }}
        </FormSheetTitle>
        <FormSheetDescription class="sr-only">
          {{ description }}
        </FormSheetDescription>
      </FormSheetHeader>

      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="isEdit && isDetailLoading" class="space-y-4">
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
          @close="handleClose"
        />
      </div>
    </FormSheetContent>
  </FormSheet>
</template>
