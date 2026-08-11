<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import QuestionEdit from './question-edit.vue'

const isOpen = ref(false)
</script>

<template>
  <UiButton @click="isOpen = true">
    <PlusIcon />
    新建快捷问答
  </UiButton>

  <!-- QuestionEdit 自带 FormSheet 响应式外壳 -->
  <QuestionEdit v-model:open="isOpen" @close="isOpen = false" />
</template>
