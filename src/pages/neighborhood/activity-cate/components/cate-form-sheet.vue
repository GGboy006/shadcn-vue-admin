<script lang="ts" setup>
import type { INeighborhoodCate } from '@/services/api/neighborhood-cate.api'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import CateForm from './cate-form.vue'

const props = defineProps<{
  open: boolean
  cate?: INeighborhoodCate
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const isEdit = computed(() => !!props.cate?.uniqueCode)

const title = computed(() => (isEdit.value ? '编辑活动分类' : '新建活动分类'))

const description = computed(() => {
  const name = props.cate?.name
  return isEdit.value ? `编辑 ${name}` : '创建一个新的活动分类'
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
      class="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
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
        <CateForm
          :cate="cate"
          @close="handleClose"
        />
      </div>

      <SheetFooter class="border-t px-4 py-3 sm:justify-start">
        <span class="text-xs text-muted-foreground">编辑完成后点击「保存」生效</span>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
