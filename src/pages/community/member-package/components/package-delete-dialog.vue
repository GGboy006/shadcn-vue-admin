<script lang="ts" setup>
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { ICommunityMemberPrice } from '@/services/api/community-member-price.api'

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
import { useDeleteMemberPriceMutation } from '@/services/api/community-member-price.api'

const props = defineProps<{
  open: boolean
  price?: ICommunityMemberPrice
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const { mutate, isPending } = useDeleteMemberPriceMutation()

function handleRemove() {
  if (!props.price)
    return
  mutate(props.price.uniqueCode, {
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
          删除套餐: {{ price?.priceName }} ?
        </AlertDialogTitle>
        <AlertDialogDescription>
          仅能删除本站套餐,此操作不可撤销。居民端购买走城市 App,删除不影响已成交订单。
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
