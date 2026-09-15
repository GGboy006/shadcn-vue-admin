<script setup lang="ts">
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IHousekeeperOrder } from '@/services/api/housekeeper-order.api'

import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCancelHousekeeperOrderMutation } from '@/services/api/housekeeper-order.api'

const props = defineProps<{
  open: boolean
  order: IHousekeeperOrder
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const cancelReason = ref('')
const { mutate, isPending } = useCancelHousekeeperOrderMutation()

watch(isOpen, (open) => {
  if (open)
    cancelReason.value = ''
})

function handleClose() {
  emit('update:open', false)
}

function handleSubmit() {
  mutate({
    orderId: props.order.orderId,
    cancelReason: cancelReason.value,
  }, {
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
          将取消 {{ order.orderNo }}。已支付且有金额的订单请引导居民在 App 取消以走退款。
        </ModalDescription>
      </ModalHeader>

      <div class="space-y-2 py-2">
        <Label for="cancel-reason">取消原因（选填）</Label>
        <Textarea
          id="cancel-reason"
          v-model="cancelReason"
          maxlength="200"
          rows="3"
          placeholder="最多 200 字，会写入订单与状态日志"
        />
      </div>

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
