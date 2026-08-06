<script lang="ts" setup>
import type { ICommunityDynamic } from '@/services/api/community-dynamic.api'

import { FormSheet, FormSheetContent, FormSheetDescription, FormSheetHeader, FormSheetTitle } from '@/components/prop-ui/form-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetDynamicDetailQuery } from '@/services/api/community-dynamic.api'

import DynamicForm from './dynamic-form.vue'

const props = defineProps<{
  open: boolean
  dynamic?: ICommunityDynamic
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

// 编辑时拉详情
const { data: detailData, isLoading: isDetailLoading } = useGetDynamicDetailQuery(uniqueCode)

const dynamicDetail = computed(() => {
  if (!isEdit.value)
    return undefined
  return detailData.value?.data
})

const title = computed(() => (isEdit.value ? '编辑小区动态' : '新建小区动态'))

const description = computed(() => {
  const name = dynamicDetail.value?.title ?? props.dynamic?.title
  return isEdit.value ? `编辑 ${name}` : '创建一条新的小区动态'
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
    </FormSheetContent>
  </FormSheet>
</template>
