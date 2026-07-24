<script lang="ts" setup>
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import { ModalClose, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useDeleteGoodsMutation } from '@/services/api/merchant-business.api'

import type { Goods } from '../data/schema'

const { goods } = defineProps<{
  goods: Goods
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const { merchantId } = useCurrentMerchantId()
const { mutate, isPending } = useDeleteGoodsMutation(merchantId)

function handleRemove() {
  mutate(goods.uniqueCode, {
    onSuccess: () => {
      toast.success('删除成功')
      emits('close')
    },
    onError: (err: any) => toast.error(err.message || '删除失败'),
  })
}
</script>

<template>
  <div>
    <ModalHeader>
      <ModalTitle>
        删除商品: {{ goods.name }} ?
      </ModalTitle>

      <ModalDescription>
        您即将删除商品「{{ goods.name }}」,此操作不可撤销。
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
