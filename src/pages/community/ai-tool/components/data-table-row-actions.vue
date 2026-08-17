<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { PencilIcon, SparklesIcon, Trash2Icon } from '@lucide/vue'

import type { IResidentAiToolCate } from '@/services/api/resident-ai-tool.api'

import { DataTableRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'

import CateDeleteDialog from './cate-delete-dialog.vue'
import CateFormSheet from './cate-form-sheet.vue'

const props = defineProps<{ row: Row<IResidentAiToolCate> }>()
const cate = computed(() => props.row.original)

const router = useRouter()

const isEditOpen = ref(false)

const isEditOpenRendered = useLazyMount(isEditOpen)
const isDeleteOpen = ref(false)
const isDeleteOpenRendered = useLazyMount(isDeleteOpen)
const items = computed(() => [
  { key: 'assign', label: '配置工具', icon: SparklesIcon },
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
])

function handleAction(key: string) {
  if (key === 'assign') {
    router.push(`/community/ai-tool/${cate.value.uniqueCode}`)
  }
  else if (key === 'edit') {
    isEditOpen.value = true
  }
  else if (key === 'delete') {
    isDeleteOpen.value = true
  }
}
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <CateFormSheet v-if="isEditOpenRendered" v-model:open="isEditOpen" :cate="cate" />
  <CateDeleteDialog v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen" :cate="cate" />
</template>
