<script lang="ts" setup>
import { toast } from 'vue-sonner'

import { ModalClose, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'

import type { User } from '../data/schema'

const { user } = defineProps<{
  user: User
}>()

const emits = defineEmits<{
  (e: 'remove'): void
}>()

function handleRemove() {
  toast(`The following task has been deleted:`, {
    description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify(user, null, 2))),
  })

  emits('remove')
}
</script>

<template>
  <div>
    <ModalHeader>
      <ModalTitle>
        删除用户: {{ user.username }} ?
      </ModalTitle>

      <ModalDescription>
        您即将删除 ID 为 {{ user.id }} 的用户，此操作不可撤销。
      </ModalDescription>
    </ModalHeader>

    <ModalFooter>
      <ModalClose as-child>
        <UiButton variant="outline">
          取消
        </UiButton>
      </ModalClose>

      <ModalClose as-child>
        <UiButton variant="destructive" @click="handleRemove">
          删除
        </UiButton>
      </ModalClose>
    </ModalFooter>
  </div>
</template>
