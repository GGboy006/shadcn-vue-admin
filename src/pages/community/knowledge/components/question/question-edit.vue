<script lang="ts" setup>
import type { IKnowledgeQuestion } from '@/services/api/knowledge.api'

import { FormSheet, FormSheetContent, FormSheetDescription, FormSheetHeader, FormSheetTitle } from '@/components/prop-ui/form-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetKnowledgeQuestionDetailQuery } from '@/services/api/knowledge.api'

import QuestionForm from './question-form.vue'

const props = defineProps<{
  open: boolean
  question?: IKnowledgeQuestion
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const isEdit = computed(() => !!props.question?.questionId)

const questionId = computed(() => props.question?.questionId)

// 编辑时拉详情
const { data: detailData, isLoading: isDetailLoading } = useGetKnowledgeQuestionDetailQuery(questionId, isOpen)

const questionDetail = computed(() => {
  if (!isEdit.value)
    return undefined
  return detailData.value?.data
})

const title = computed(() => (isEdit.value ? '编辑快捷问答' : '新建快捷问答'))

const description = computed(() => {
  const name = questionDetail.value?.questionName ?? props.question?.questionName
  return isEdit.value ? `编辑 ${name}` : '创建一条新的快捷问答'
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
          <Skeleton class="h-24 w-full" />
        </div>

        <QuestionForm
          v-else
          :question="questionDetail"
          @close="handleClose"
        />
      </div>
    </FormSheetContent>
  </FormSheet>
</template>
