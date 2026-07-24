<script lang="ts" setup>
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import { ModalClose, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useDeleteCateMutation } from '@/services/api/merchant-business.api'

import type { Category } from '../data/schema'

const { category } = defineProps<{
  category: Category
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const { merchantId } = useCurrentMerchantId()
const { mutate, isPending } = useDeleteCateMutation(merchantId)

function handleRemove() {
  mutate(category.uniqueCode, {
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
        删除分类: {{ category.name }} ?
      </ModalTitle>

      <ModalDescription>
        您即将删除分类「{{ category.name }}」,该分类下有 {{ category.goodsCount ?? 0 }} 个商品。此操作不可撤销。
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
