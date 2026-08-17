<script lang="ts" setup>
import type { IHousekeeperCategory } from '@/services/api/housekeeper.api'

import { FormSheet, FormSheetContent, FormSheetDescription, FormSheetHeader, FormSheetTitle } from '@/components/prop-ui/form-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetHousekeeperCategoryDetailQuery } from '@/services/api/housekeeper.api'

import CategoryForm from './category-form.vue'

const props = defineProps<{
  open: boolean
  category?: IHousekeeperCategory
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const isEdit = computed(() => !!props.category?.categoryId)

const categoryId = computed(() => props.category?.categoryId)

// 编辑时拉详情
const { data: detailData, isLoading: isDetailLoading } = useGetHousekeeperCategoryDetailQuery(categoryId, isOpen)

const categoryDetail = computed(() => {
  if (!isEdit.value)
    return undefined
  return detailData.value?.data
})

const title = computed(() => (isEdit.value ? '编辑服务分类' : '新建服务分类'))

const description = computed(() => {
  const name = categoryDetail.value?.categoryName ?? props.category?.categoryName
  return isEdit.value ? `编辑 ${name}` : '创建一条新的服务分类'
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
          <Skeleton class="h-10 w-full" />
          <div class="grid grid-cols-2 gap-4">
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
          </div>
        </div>

        <CategoryForm
          v-else
          :category="categoryDetail"
          @close="handleClose"
        />
      </div>
    </FormSheetContent>
  </FormSheet>
</template>
