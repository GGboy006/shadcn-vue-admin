<script lang="ts" setup>
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IHousekeeperService } from '@/services/api/housekeeper.api'

import { ModalClose, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { useDeleteHousekeeperServiceMutation } from '@/services/api/housekeeper.api'

const { service } = defineProps<{
  service: IHousekeeperService
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const { mutate, isPending } = useDeleteHousekeeperServiceMutation()

function handleRemove() {
  mutate(service.housekeeperId, {
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
        删除服务主体: {{ service.name }} ?
      </ModalTitle>

      <ModalDescription>
        删除主体不会自动删除其下人员,但会解除相关分配。此操作不可撤销。
      </ModalDescription>
    </ModalHeader>

    <ModalFooter>
      <ModalClose as-child>
        <Button variant="outline">
          取消
        </Button>
      </ModalClose>

      <Button variant="destructive" :disabled="isPending" @click="handleRemove">
        <LoaderIcon v-if="isPending" class="mr-1 size-4 animate-spin" />
        {{ isPending ? '删除中...' : '删除' }}
      </Button>
    </ModalFooter>
  </div>
</template>
