<script lang="ts" setup>
import type { INeighborhoodDynamic } from '@/services/api/neighborhood-dynamic.api'

import {
  FormSheet,
  FormSheetContent,
  FormSheetDescription,
  FormSheetFooter,
  FormSheetHeader,
  FormSheetTitle,
} from '@/components/prop-ui/form-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetDynamicDetailQuery } from '@/services/api/neighborhood-dynamic.api'

import DynamicForm from './dynamic-form.vue'

const props = defineProps<{
  open: boolean
  dynamic?: INeighborhoodDynamic
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const isEdit = computed(() => !!props.dynamic?.uniqueCode)

const uniqueCode = computed(() => props.dynamic?.uniqueCode)

const { data: detailData, isLoading: isDetailLoading } = useGetDynamicDetailQuery(uniqueCode, isOpen)

const dynamicDetail = computed(() => {
  if (!isEdit.value)
    return undefined
  return detailData.value?.data
})

const title = computed(() => (isEdit.value ? '编辑资讯动态' : '新建资讯动态'))

const description = computed(() => {
  const name = dynamicDetail.value?.title ?? props.dynamic?.title
  return isEdit.value ? `编辑 ${name}` : '创建一条新的资讯动态'
})

function handleClose() {
  emit('close')
  emit('update:open', false)
}
</script>

<template>
  <FormSheet v-model:open="isOpen">
    <FormSheetContent
      class="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl"
    >
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
          <Skeleton class="h-24 w-full" />
          <div class="grid grid-cols-2 gap-4">
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
          </div>
        </div>

        <DynamicForm
          v-else
          :dynamic="dynamicDetail"
          @close="handleClose"
        />
      </div>

      <FormSheetFooter class="border-t px-4 py-3 sm:justify-start">
        <span class="text-xs text-muted-foreground">编辑完成后点击「保存」生效</span>
      </FormSheetFooter>
    </FormSheetContent>
  </FormSheet>
</template>
