<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { ArchiveIcon, PencilIcon, PinIcon, PinOffIcon, SendIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IKnowledgeArticle, KnowledgePublishStatus } from '@/services/api/knowledge.api'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { useUpdateKnowledgeArticlePublishStatusMutation, useUpdateKnowledgeArticleTopMutation } from '@/services/api/knowledge.api'

import ArticleDeleteContent from './article-delete.vue'
import ArticleEdit from './article-edit.vue'

interface DataTableRowActionsProps {
  row: Row<IKnowledgeArticle>
  /** 钻取页传入:锁定分类 */
  lockCategoryId?: number
}
const props = defineProps<DataTableRowActionsProps>()
const article = computed(() => props.row.original)

const isEditOpen = ref(false)

const isEditOpenRendered = useLazyMount(isEditOpen)
const isDeleteOpen = ref(false)
const isDeleteOpenRendered = useLazyMount(isDeleteOpen)
const showComponent = shallowRef<Component | null>(null)

const { mutate: updatePublishStatus, isPending: isPublishing } = useUpdateKnowledgeArticlePublishStatusMutation()
const { mutate: updateTop, isPending: isTogglingTop } = useUpdateKnowledgeArticleTopMutation()

// 全站通用数据(editable=false)不可改删
const editable = computed(() => article.value.editable !== false)

const isPinned = computed(() => article.value.topFlag === 1)
const isPublished = computed(() => article.value.publishStatus === 1)

// 发布状态切换:已发布 -> 下架,其他 -> 发布
function nextPublishStatus(current?: KnowledgePublishStatus): KnowledgePublishStatus {
  if (current === 1)
    return 2 // 已发布 -> 已下架
  return 1 // 草稿/已下架 -> 已发布
}

const items = computed(() => {
  if (!editable.value)
    return []
  const list: { key: string, label: string, icon: any, variant?: 'destructive', disabled?: boolean }[] = [
    { key: 'edit', label: '编辑', icon: PencilIcon },
    {
      key: 'togglePublish',
      label: isPublished.value ? '下架' : '发布',
      icon: isPublished.value ? ArchiveIcon : SendIcon,
      disabled: isPublishing.value,
    },
    {
      key: 'toggleTop',
      label: isPinned.value ? '取消置顶' : '置顶',
      icon: isPinned.value ? PinOffIcon : PinIcon,
      disabled: isTogglingTop.value,
    },
    { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
  ]
  return list
})

function handleTogglePublish() {
  const next = nextPublishStatus(article.value.publishStatus)
  updatePublishStatus({ articleId: article.value.articleId, publishStatus: next }, {
    onSuccess: () => {
      toast.success(next === 1 ? '已发布' : '已下架')
    },
    onError: (err: any) => {
      toast.error(err.message || '操作失败')
    },
  })
}

function handleToggleTop() {
  const next = isPinned.value ? 0 : 1
  updateTop({ articleId: article.value.articleId, topFlag: next }, {
    onSuccess: () => {
      toast.success(next === 1 ? '已置顶' : '已取消置顶')
    },
    onError: (err: any) => {
      toast.error(err.message || '操作失败')
    },
  })
}

function handleAction(key: string) {
  if (key === 'edit') {
    isEditOpen.value = true
  }
  else if (key === 'togglePublish') {
    handleTogglePublish()
  }
  else if (key === 'toggleTop') {
    handleToggleTop()
  }
  else if (key === 'delete') {
    showComponent.value = ArticleDeleteContent
    isDeleteOpen.value = true
  }
}
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <ArticleEdit v-if="isEditOpenRendered" v-model:open="isEditOpen" :article="article" :lock-category-id="lockCategoryId" @close="isEditOpen = false" />

  <Modal v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen">
    <ModalContent>
      <component
        :is="showComponent"
        :article="article"
        @close="isDeleteOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
