<script lang="ts" setup>
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMerchantDetailQuery } from '@/services/api/merchant.api'

import type { Merchant } from '../../merchants/data/schema'

import CommitteeForm from './committee-form.vue'

const props = defineProps<{
  open: boolean
  /** 编辑时传入列表项;新建时为 undefined */
  committee?: Merchant
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const isEdit = computed(() => !!props.committee?.merchantId)

const merchantId = computed(() => props.committee?.merchantId)

// 编辑时拉详情回填表单(列表项字段不全,以详情为准)
const { data: detailData, isLoading: isDetailLoading } = useGetMerchantDetailQuery(
  computed(() => merchantId.value),
  isOpen,
)

const committeeDetail = computed(() => {
  if (!isEdit.value)
    return undefined
  return detailData.value?.data
})

const title = computed(() => (isEdit.value ? '编辑居委会' : '新建居委会'))

const description = computed(() => {
  const name = committeeDetail.value?.merchantName ?? props.committee?.merchantName
  return isEdit.value ? `编辑 ${name}` : '绑定城市居委会并创建本地管理员账号'
})

function handleClose() {
  emit('close')
  emit('update:open', false)
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent
      side="right"
      class="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl"
    >
      <SheetHeader class="border-b px-4 py-3">
        <SheetTitle class="text-base">
          {{ title }}
        </SheetTitle>
        <SheetDescription class="sr-only">
          {{ description }}
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="isEdit && isDetailLoading" class="space-y-4">
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-24 w-full" />
          <div class="grid grid-cols-2 gap-4">
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
          </div>
        </div>

        <CommitteeForm
          v-else
          :committee="committeeDetail"
          @close="handleClose"
        />
      </div>

      <SheetFooter class="border-t px-4 py-3 sm:justify-start">
        <span class="text-xs text-muted-foreground">编辑完成后点击「保存」生效</span>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
