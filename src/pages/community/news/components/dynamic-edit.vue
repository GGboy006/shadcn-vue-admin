<script lang="ts" setup>
import type { ICommunityDynamic } from '@/services/api/community-dynamic.api'

import { ModalDescription, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetDynamicDetailQuery } from '@/services/api/community-dynamic.api'

import DynamicForm from './dynamic-form.vue'

const props = defineProps<{
  dynamic?: ICommunityDynamic
}>()

defineEmits(['close'])

const isEdit = computed(() => !!props.dynamic?.uniqueCode)

const uniqueCode = computed(() => props.dynamic?.uniqueCode)

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

    <DynamicForm
      v-else
      :dynamic="dynamicDetail"
      @close="$emit('close')"
    />
  </div>
</template>
