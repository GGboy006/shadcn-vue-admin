<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import ServiceEdit from './service-edit.vue'

const isOpen = ref(false)
</script>

<template>
  <UiButton @click="isOpen = true">
    <PlusIcon />
    新建主体
  </UiButton>

  <!-- ServiceEdit 自带 FormSheet 响应式外壳 -->
  <ServiceEdit v-model:open="isOpen" @close="isOpen = false" />
</template>
