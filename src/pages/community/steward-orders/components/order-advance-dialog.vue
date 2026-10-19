<script setup lang="ts">
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IHousekeeperOrder } from '@/services/api/housekeeper-order.api'

import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { useAdvanceHousekeeperOrderMutation } from '@/services/api/housekeeper-order.api'
import { advanceHousekeeperOrderLabel } from '@/services/api/housekeeper-order.rules'

const props = defineProps<{
  open: boolean
  order: IHousekeeperOrder
  status: 1 | 2 | 4
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const actionLabel = computed(() => advanceHousekeeperOrderLabel(props.status))
const { mutate, isPending } = useAdvanceHousekeeperOrderMutation()

function handleClose() {
  emit('update:open', false)
}

function handleSubmit() {
  mutate({
    orderId: props.order.orderId,
    status: props.status,
  }, {
    onSuccess: () => {
      toast.success(`已${actionLabel.value}`)
      handleClose()
    },
    onError: (err: Error) => toast.error(err.message || '推进失败'),
  })
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-md">
      <ModalHeader>
        <ModalTitle class="text-base">
          {{ actionLabel }}
        </ModalTitle>
        <ModalDescription>
          将把订单 {{ order.orderNo }} 推进为{{ actionLabel }}。
        </ModalDescription>
      </ModalHeader>
      <ModalFooter>
        <Button variant="outline" :disabled="isPending" @click="handleClose">
          取消
        </Button>
        <Button :disabled="isPending" @click="handleSubmit">
          <LoaderIcon v-if="isPending" class="mr-1 size-4 animate-spin" />
          {{ isPending ? '提交中...' : '确认' }}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
</template>
