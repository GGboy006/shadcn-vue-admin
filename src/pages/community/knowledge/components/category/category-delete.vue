<script lang="ts" setup>
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IKnowledgeCategory } from '@/services/api/knowledge.api'

import { ModalClose, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { useDeleteKnowledgeCategoryMutation } from '@/services/api/knowledge.api'

const { category } = defineProps<{
  category: IKnowledgeCategory
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const { mutate, isPending } = useDeleteKnowledgeCategoryMutation()

function handleRemove() {
  mutate(category.categoryId, {
    onSuccess: () => {
      toast.success('删除成功')
      emits('close')
    },
    onError: (err: any) => {
      toast.error(err.message || '删除失败')
    },
  })
}
</script>

<template>
  <div>
    <ModalHeader>
      <ModalTitle>
        删除知识分类: {{ category.categoryName }} ?
      </ModalTitle>

      <ModalDescription>
        您即将删除该知识分类，此操作不可撤销。
      </ModalDescription>
    </ModalHeader>

    <ModalFooter>
      <ModalClose as-child>
        <Button variant="outline">
          取消
        </Button>
      </ModalClose>

      <Button variant="destructive" :disabled="isPending" @click="handleRemove">
        <LoaderIcon v-if="isPending" class="size-4 mr-1 animate-spin" />
        {{ isPending ? '删除中...' : '删除' }}
      </Button>
    </ModalFooter>
  </div>
</template>
