<script lang="ts" setup>
import { toast } from 'vue-sonner'

import { ModalClose, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'

import type { Task } from '../data/schema'

const props = defineProps<{
  task: Task
}>()

function handleRemove() {
  toast(`以下任务已删除：`, {
    description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify(props.task, null, 2))),
  })
}
</script>

<template>
  <div>
    <ModalHeader>
      <ModalTitle>
        删除任务: {{ task.id }} ?
      </ModalTitle>
      <ModalDescription>
        您即将删除 ID 为 {{ task.id }} 的任务，此操作不可撤销。
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
