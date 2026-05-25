<script lang="ts" setup>
import { ModalDescription, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'

import type { Task } from '../data/schema'

import TaskForm from './task-form.vue'

const props = defineProps<{
  task: Task | null
}>()
defineEmits(['close'])

const task = computed(() => props.task)
const title = computed(() => task.value?.id ? `编辑任务` : '新建任务')
const description = computed(() => task.value?.id ? `编辑任务 ${task.value.id}` : '创建新任务')
</script>

<template>
  <div>
    <ModalHeader>
      <ModalTitle>
        {{ title }}
      </ModalTitle>
      <ModalDescription>
        {{ description }}
      </ModalDescription>
    </ModalHeader>
    <TaskForm class="mt-2" :task="task" @close="$emit('close')" />
  </div>
</template>
