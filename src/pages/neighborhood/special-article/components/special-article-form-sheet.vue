<script lang="ts" setup>
import type { INeighborhoodSpecialArticle } from '@/services/api/neighborhood-special-article.api'

import {
  FormSheet,
  FormSheetContent,
  FormSheetDescription,
  FormSheetFooter,
  FormSheetHeader,
  FormSheetTitle,
} from '@/components/prop-ui/form-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetSpecialArticleDetailQuery } from '@/services/api/neighborhood-special-article.api'

import SpecialArticleForm from './special-article-form.vue'

const props = defineProps<{
  open: boolean
  article?: INeighborhoodSpecialArticle
  /** 新建时由列表页传入(从路由 [specialCode] 取) */
  specialCode?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const isEdit = computed(() => !!props.article?.uniqueCode)

const uniqueCode = computed(() => props.article?.uniqueCode)

const { data: detailData, isLoading: isDetailLoading } = useGetSpecialArticleDetailQuery(uniqueCode, isOpen)

const articleDetail = computed(() => {
  if (!isEdit.value)
    return undefined
  return detailData.value?.data
})

const title = computed(() => (isEdit.value ? '编辑专题文章' : '新建专题文章'))

const description = computed(() => {
  const name = articleDetail.value?.title ?? props.article?.title
  return isEdit.value ? `编辑 ${name}` : '创建一篇新的专题文章'
})

function handleClose() {
  emit('close')
  emit('update:open', false)
}
</script>

<template>
  <FormSheet v-model:open="isOpen">
    <FormSheetContent
      class="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl"
    >
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

        <SpecialArticleForm
          v-else
          :article="articleDetail"
          :special-code="specialCode"
          @close="handleClose"
        />
      </div>

      <FormSheetFooter class="border-t px-4 py-3 sm:justify-start">
        <span class="text-xs text-muted-foreground">编辑完成后点击「保存」生效</span>
      </FormSheetFooter>
    </FormSheetContent>
  </FormSheet>
</template>
