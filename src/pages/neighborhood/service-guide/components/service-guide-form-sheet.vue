<script lang="ts" setup>
import type { INeighborhoodServiceGuide } from '@/services/api/neighborhood-service-guide.api'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetServiceGuideDetailQuery } from '@/services/api/neighborhood-service-guide.api'

import ServiceGuideForm from './service-guide-form.vue'

const props = defineProps<{
  open: boolean
  guide?: INeighborhoodServiceGuide
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const isEdit = computed(() => !!props.guide?.uniqueCode)

const uniqueCode = computed(() => props.guide?.uniqueCode)

const { data: detailData, isLoading: isDetailLoading } = useGetServiceGuideDetailQuery(uniqueCode, isOpen)

const guideDetail = computed(() => {
  if (!isEdit.value)
    return undefined
  return detailData.value?.data
})

const title = computed(() => (isEdit.value ? '编辑服务热线' : '新建服务热线'))

const description = computed(() => {
  const name = guideDetail.value?.unit ?? props.guide?.unit
  return isEdit.value ? `编辑 ${name}` : '创建一条新的服务热线'
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

        <ServiceGuideForm
          v-else
          :guide="guideDetail"
          @close="handleClose"
        />
      </div>

      <SheetFooter class="border-t px-4 py-3 sm:justify-start">
        <span class="text-xs text-muted-foreground">编辑完成后点击「保存」生效</span>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
