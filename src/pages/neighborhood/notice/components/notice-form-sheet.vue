<script lang="ts" setup>
import type { INeighborhoodNotice } from '@/services/api/neighborhood-notice.api'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetNoticeDetailQuery } from '@/services/api/neighborhood-notice.api'

import NoticeForm from './notice-form.vue'

const props = defineProps<{
  open: boolean
  notice?: INeighborhoodNotice
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const isEdit = computed(() => !!props.notice?.uniqueCode)

const uniqueCode = computed(() => props.notice?.uniqueCode)

// 编辑时拉详情回填表单(列表项字段不全,以详情为准)
const { data: detailData, isLoading: isDetailLoading } = useGetNoticeDetailQuery(uniqueCode)

const noticeDetail = computed(() => {
  if (!isEdit.value)
    return undefined
  return detailData.value?.data
})

const title = computed(() => (isEdit.value ? '编辑居委会公告' : '新建居委会公告'))

const description = computed(() => {
  const name = noticeDetail.value?.title ?? props.notice?.title
  return isEdit.value ? `编辑 ${name}` : '创建一条新的居委会公告'
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

        <NoticeForm
          v-else
          :notice="noticeDetail"
          @close="handleClose"
        />
      </div>

      <SheetFooter class="border-t px-4 py-3 sm:justify-start">
        <SheetClose as-child>
          <span class="text-xs text-muted-foreground">编辑完成后点击「保存」生效</span>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
