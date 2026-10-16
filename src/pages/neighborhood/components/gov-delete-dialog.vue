<script setup lang="ts">
import { LoaderIcon } from '@lucide/vue'

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

defineProps<{
  title: string
  pending?: boolean
}>()

const emit = defineEmits<{ confirm: [] }>()

const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>
          删除后不能恢复。
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="pending">
          取消
        </AlertDialogCancel>
        <AlertDialogAction
          :disabled="pending"
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          @click="emit('confirm')"
        >
          <LoaderIcon v-if="pending" class="mr-1 size-4 animate-spin" />
          {{ pending ? '删除中...' : '删除' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
