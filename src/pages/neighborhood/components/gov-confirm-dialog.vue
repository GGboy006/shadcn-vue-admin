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

withDefaults(defineProps<{
  title: string
  description?: string
  confirmText?: string
  pending?: boolean
  destructive?: boolean
}>(), {
  description: '',
  confirmText: '确定',
  destructive: false,
})

const emit = defineEmits<{ confirm: [] }>()
const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="description">
          {{ description }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="pending">
          取消
        </AlertDialogCancel>
        <AlertDialogAction
          :disabled="pending"
          :class="destructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''"
          @click="emit('confirm')"
        >
          <LoaderIcon v-if="pending" class="mr-1 size-4 animate-spin" />
          {{ pending ? '提交中...' : confirmText }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
