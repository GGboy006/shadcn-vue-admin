<script lang="ts" setup>
import type { ICommunityNotice } from '@/services/api/community-notice.api'

import { ModalDescription, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetNoticeDetailQuery } from '@/services/api/community-notice.api'

import NoticeForm from './notice-form.vue'

const props = defineProps<{
  notice?: ICommunityNotice
}>()

defineEmits(['close'])

const isEdit = computed(() => !!props.notice?.uniqueCode)

const uniqueCode = computed(() => props.notice?.uniqueCode)

const { data: detailData, isLoading: isDetailLoading } = useGetNoticeDetailQuery(uniqueCode)

const noticeDetail = computed(() => {
  if (!isEdit.value)
    return undefined
  return detailData.value?.data
})

const title = computed(() => (isEdit.value ? '编辑小区公告' : '新建小区公告'))

const description = computed(() => {
  const name = noticeDetail.value?.title ?? props.notice?.title
  return isEdit.value ? `编辑 ${name}` : '创建一条新的小区公告'
})
</script>

<template>
  <div>
    <ModalHeader>
      <ModalTitle>
        {{ title }}
      </ModalTitle>
      <ModalDescription>
        {{ description }}
      </ModalDescription>
    </ModalHeader>

    <div v-if="isEdit && isDetailLoading" class="space-y-4 py-4">
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
      @close="$emit('close')"
    />
  </div>
</template>
