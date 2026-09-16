<script lang="ts" setup>
import type { ICommunityMemberPrice } from '@/services/api/community-member-price.api'

import {
  FormSheet,
  FormSheetContent,
  FormSheetDescription,
  FormSheetFooter,
  FormSheetHeader,
  FormSheetTitle,
} from '@/components/prop-ui/form-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMemberPriceDetailQuery } from '@/services/api/community-member-price.api'

import PackageForm from './package-form.vue'

const props = defineProps<{
  open: boolean
  price?: ICommunityMemberPrice
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const isEdit = computed(() => !!props.price?.uniqueCode)
const uniqueCode = computed(() => props.price?.uniqueCode)
const { data: detailData, isLoading: isDetailLoading } = useGetMemberPriceDetailQuery(uniqueCode, isOpen)

const priceDetail = computed(() => {
  if (!isEdit.value)
    return undefined
  return detailData.value?.data ?? props.price
})

const title = computed(() => (isEdit.value ? '编辑套餐' : '新建套餐'))

const description = computed(() => {
  const name = priceDetail.value?.priceName ?? props.price?.priceName
  return isEdit.value ? `编辑 ${name}` : '为本小区新增一个会员套餐'
})

function handleClose() {
  emit('close')
  emit('update:open', false)
}
</script>

<template>
  <FormSheet v-model:open="isOpen">
    <FormSheetContent class="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl">
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
          <Skeleton class="h-20 w-full" />
        </div>

        <PackageForm
          v-else
          :price="priceDetail"
          @close="handleClose"
        />
      </div>

      <FormSheetFooter class="border-t px-4 py-3 sm:justify-start">
        <span class="text-xs text-muted-foreground">站点由接口按当前站长写入,无需填写</span>
      </FormSheetFooter>
    </FormSheetContent>
  </FormSheet>
</template>
