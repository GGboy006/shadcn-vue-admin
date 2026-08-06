<script lang="ts" setup>
import type { INeighborhoodActivity } from '@/services/api/neighborhood-activity.api'

import {
  FormSheet,
  FormSheetContent,
  FormSheetDescription,
  FormSheetFooter,
  FormSheetHeader,
  FormSheetTitle,
} from '@/components/prop-ui/form-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetActivityDetailQuery } from '@/services/api/neighborhood-activity.api'

import ActivityForm from './activity-form.vue'

const props = defineProps<{
  open: boolean
  activity?: INeighborhoodActivity
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const isEdit = computed(() => !!props.activity?.uniqueCode)

const uniqueCode = computed(() => props.activity?.uniqueCode)

// 编辑时拉详情回填表单(列表项字段不全,以详情为准)
const { data: detailData, isLoading: isDetailLoading } = useGetActivityDetailQuery(uniqueCode, isOpen)

const activityDetail = computed(() => {
  if (!isEdit.value)
    return undefined
  return detailData.value?.data
})

const title = computed(() => (isEdit.value ? '编辑活动' : '新建活动'))

const description = computed(() => {
  const name = activityDetail.value?.name ?? props.activity?.name
  return isEdit.value ? `编辑 ${name}` : '创建一个新的活动'
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

        <ActivityForm
          v-else
          :activity="activityDetail"
          @close="handleClose"
        />
      </div>

      <FormSheetFooter class="border-t px-4 py-3 sm:justify-start">
        <span class="text-xs text-muted-foreground">编辑完成后点击「保存」生效</span>
      </FormSheetFooter>
    </FormSheetContent>
  </FormSheet>
</template>
