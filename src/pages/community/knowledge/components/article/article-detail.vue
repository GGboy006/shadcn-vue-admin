<script setup lang="ts">
import { marked } from 'marked'

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/prop-ui/modal'
import { RichTextContent } from '@/components/prop-ui/rich-text'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { knowledgePublishStatusConfig, useGetKnowledgeArticleDetailQuery } from '@/services/api/knowledge.api'

const props = defineProps<{
  open: boolean
  articleId?: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const articleId = computed(() => props.articleId)
const { data, isLoading } = useGetKnowledgeArticleDetailQuery(articleId, isOpen)
const detail = computed(() => data.value?.data)

const publishConfig = computed(() => {
  const status = detail.value?.publishStatus
  if (status === undefined || status === null)
    return undefined
  return knowledgePublishStatusConfig[status]
})

/** 列表/详情可能是 TipTap HTML,全站科普文章也可能是 Markdown */
const contentHtml = computed(() => {
  const raw = detail.value?.content
  if (!raw)
    return ''
  if (/<[a-z][\s\S]*>/i.test(raw))
    return raw
  return marked.parse(raw, { async: false }) as string
})
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-2xl">
      <ModalHeader>
        <ModalTitle class="text-base">
          文章详情
        </ModalTitle>
        <ModalDescription class="sr-only">
          查看知识文章正文
        </ModalDescription>
      </ModalHeader>

      <div class="max-h-[70vh] overflow-y-auto">
        <div v-if="isLoading" class="space-y-4">
          <Skeleton class="h-6 w-2/3" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-1/2" />
        </div>

        <div v-else-if="detail" class="space-y-4">
          <div class="space-y-2">
            <h2 class="text-lg font-semibold">
              {{ detail.title }}
            </h2>
            <div class="flex flex-wrap items-center gap-2">
              <Badge v-if="publishConfig" :variant="publishConfig.variant">
                {{ publishConfig.label }}
              </Badge>
              <span v-if="detail.categoryName" class="text-xs text-muted-foreground">
                {{ detail.categoryName }}
              </span>
              <span v-if="detail.author" class="text-xs text-muted-foreground">
                {{ detail.author }}
              </span>
            </div>
          </div>

          <img
            v-if="detail.coverImage"
            :src="detail.coverImage"
            alt="封面"
            class="max-h-48 w-full rounded border object-cover"
          >

          <p v-if="detail.summary" class="text-sm text-muted-foreground">
            {{ detail.summary }}
          </p>

          <RichTextContent v-if="contentHtml" :content="contentHtml" />
          <p v-else class="py-6 text-center text-sm text-muted-foreground">
            暂无正文
          </p>
        </div>

        <div v-else class="py-10 text-center text-sm text-muted-foreground">
          未找到文章
        </div>
      </div>
    </ModalContent>
  </Modal>
</template>
