<script lang="ts" setup>
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import { ModalClose, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { merchantTypeConfig, useDeleteMerchantMutation } from '@/services/api/merchant.api'

import type { Merchant } from '../data/schema'

const { merchant } = defineProps<{
  merchant: Merchant
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const { mutate, isPending } = useDeleteMerchantMutation()

function handleRemove() {
  mutate(merchant.merchantId, {
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
        删除{{ merchantTypeConfig[merchant.type]?.label || '商户/物业' }}: {{ merchant.merchantName }} ?
      </ModalTitle>

      <ModalDescription>
        您即将删除 ID 为 {{ merchant.merchantId }} 的{{ merchantTypeConfig[merchant.type]?.label || '商户/物业' }}，此操作不可撤销。
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
