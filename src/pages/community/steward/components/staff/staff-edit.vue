<script lang="ts" setup>
import type { IHousekeeperStaff } from '@/services/api/housekeeper.api'

import { FormSheet, FormSheetContent, FormSheetDescription, FormSheetHeader, FormSheetTitle } from '@/components/prop-ui/form-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetHousekeeperStaffDetailQuery } from '@/services/api/housekeeper.api'

import StaffForm from './staff-form.vue'

const props = defineProps<{
  open: boolean
  staff?: IHousekeeperStaff
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const isEdit = computed(() => !!props.staff?.staffId)

const staffId = computed(() => props.staff?.staffId)

// 编辑时拉详情
const { data: detailData, isLoading: isDetailLoading } = useGetHousekeeperStaffDetailQuery(staffId, isOpen)

const staffDetail = computed(() => {
  if (!isEdit.value)
    return undefined
  return detailData.value?.data
})

const title = computed(() => (isEdit.value ? '编辑服务人员' : '新建服务人员'))

const description = computed(() => {
  const name = staffDetail.value?.staffName ?? props.staff?.staffName
  return isEdit.value ? `编辑 ${name}` : '创建一条新的服务人员'
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

        <StaffForm
          v-else
          :staff="staffDetail"
          @close="handleClose"
        />
      </div>
    </FormSheetContent>
  </FormSheet>
</template>
