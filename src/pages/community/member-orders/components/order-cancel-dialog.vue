<script setup lang="ts">
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { ICommunityMemberOrder } from '@/services/api/community-member-order.api'

import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { canCancelMemberOrder, useCancelMemberOrderMutation } from '@/services/api/community-member-order.api'

const props = defineProps<{
  open: boolean
  order: ICommunityMemberOrder
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const { mutate, isPending } = useCancelMemberOrderMutation()

function handleClose() {
  emit('update:open', false)
}

function handleSubmit() {
  if (!canCancelMemberOrder(props.order) || !props.order.orderId)
    return
  mutate(props.order.orderId, {
    onSuccess: () => {
      toast.success('已取消订单')
      handleClose()
    },
    onError: (err: any) => toast.error(err.message || '取消失败'),
  })
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-md">
      <ModalHeader>
        <ModalTitle class="text-base">
          取消订单
        </ModalTitle>
        <ModalDescription>
          仅待支付订单可取消。将取消 {{ order.orderNo || order.orderId }}，无需填写原因。
        </ModalDescription>
      </ModalHeader>

      <ModalFooter>
        <Button variant="outline" :disabled="isPending" @click="handleClose">
          返回
        </Button>
        <Button variant="destructive" :disabled="isPending" @click="handleSubmit">
          <LoaderIcon v-if="isPending" class="mr-1 size-4 animate-spin" />
          {{ isPending ? '取消中...' : '确认取消' }}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
</template>
