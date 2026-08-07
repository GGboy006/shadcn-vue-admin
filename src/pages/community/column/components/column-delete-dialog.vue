<script lang="ts" setup>
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { ICommunityColumn } from '@/services/api/community-column.api'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteColumnMutation } from '@/services/api/community-column.api'

const props = defineProps<{
  open: boolean
  column?: ICommunityColumn
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const { mutate, isPending } = useDeleteColumnMutation()

function handleRemove() {
  if (!props.column)
    return
  mutate(props.column.uniqueCode, {
    onSuccess: () => {
      toast.success('删除成功')
      emit('close')
      emit('update:open', false)
    },
    onError: (err: any) => {
      toast.error(err.message || '删除失败')
    },
  })
}
</script>

<template>
  <AlertDialog v-model:open="isOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          删除栏目: {{ column?.name }} ?
        </AlertDialogTitle>
        <AlertDialogDescription>
          您即将删除该栏目,此操作不可撤销。
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isPending">
          取消
        </AlertDialogCancel>
        <AlertDialogAction
          :disabled="isPending"
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          @click="handleRemove"
        >
          <LoaderIcon v-if="isPending" class="mr-1 size-4 animate-spin" />
          {{ isPending ? '删除中...' : '删除' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
