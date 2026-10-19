<script lang="ts" setup>
import type { IPartnerStaff } from '@/services/api/housekeeper-partner.api'

import { FormSheet, FormSheetContent, FormSheetDescription, FormSheetHeader, FormSheetTitle } from '@/components/prop-ui/form-sheet'

import StaffForm from './staff-form.vue'

const props = defineProps<{
  open: boolean
  staff?: IPartnerStaff
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
const title = computed(() => isEdit.value ? '编辑服务人员' : '新建服务人员')

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
          {{ isEdit ? `编辑 ${staff?.staffName}` : '新增合作方服务人员' }}
        </FormSheetDescription>
      </FormSheetHeader>
      <div class="flex-1 overflow-y-auto p-4">
        <StaffForm :staff="staff" @close="handleClose" />
      </div>
    </FormSheetContent>
  </FormSheet>
</template>
