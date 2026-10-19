<script lang="ts" setup>
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IPartnerStaff } from '@/services/api/housekeeper-partner.api'

import { ModalClose, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { useDeletePartnerStaffMutation } from '@/services/api/housekeeper-partner.api'

const { staff } = defineProps<{
  staff: IPartnerStaff
}>()

const emit = defineEmits<{
  close: []
}>()

const { mutate, isPending } = useDeletePartnerStaffMutation()

function handleRemove() {
  mutate(staff.staffId, {
    onSuccess: () => {
      toast.success('删除成功')
      emit('close')
    },
    onError: (err: Error) => toast.error(err.message || '删除失败'),
  })
}
</script>

<template>
  <div>
    <ModalHeader>
      <ModalTitle>
        删除服务人员: {{ staff.staffName }} ?
      </ModalTitle>
      <ModalDescription>
        删除后不能再被站长分配。此操作不可撤销。
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
