<script lang="ts" setup>
import type { IHousekeeperService } from '@/services/api/housekeeper.api'

import { FormSheet, FormSheetContent, FormSheetDescription, FormSheetHeader, FormSheetTitle } from '@/components/prop-ui/form-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetHousekeeperServiceDetailQuery } from '@/services/api/housekeeper.api'

import ServiceForm from './service-form.vue'

const props = defineProps<{
  open: boolean
  service?: IHousekeeperService
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const isEdit = computed(() => !!props.service?.housekeeperId)

const housekeeperId = computed(() => props.service?.housekeeperId)

// 编辑时拉详情
const { data: detailData, isLoading: isDetailLoading } = useGetHousekeeperServiceDetailQuery(housekeeperId)

const serviceDetail = computed(() => {
  if (!isEdit.value)
    return undefined
  return detailData.value?.data
})

const title = computed(() => (isEdit.value ? '编辑服务主体' : '新建服务主体'))

const description = computed(() => {
  const name = serviceDetail.value?.name ?? props.service?.name
  return isEdit.value ? `编辑 ${name}` : '创建一条新的服务主体'
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

        <ServiceForm
          v-else
          :service="serviceDetail"
          @close="handleClose"
        />
      </div>
    </FormSheetContent>
  </FormSheet>
</template>
