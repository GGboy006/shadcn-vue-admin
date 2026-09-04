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

const hasStaff = computed(() => (service.staffCount ?? 0) > 0)

function handleRemove() {
  if (hasStaff.value) {
    toast.error(`该机构下还有 ${service.staffCount} 名人员，请先移除后再删除`)
    return
  }
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

      <ModalDescription v-if="hasStaff">
        该机构下还有 {{ service.staffCount }} 名人员，请先移除人员后再删除机构。
      </ModalDescription>
      <ModalDescription v-else>
        删除后不可恢复，请确认该机构已不再使用。
      </ModalDescription>
    </ModalHeader>

    <ModalFooter>
      <ModalClose as-child>
        <Button variant="outline">
          取消
        </Button>
      </ModalClose>

      <Button variant="destructive" :disabled="isPending || hasStaff" @click="handleRemove">
        <LoaderIcon v-if="isPending" class="mr-1 size-4 animate-spin" />
        {{ isPending ? '删除中...' : '删除' }}
      </Button>
    </ModalFooter>
  </div>
</template>
