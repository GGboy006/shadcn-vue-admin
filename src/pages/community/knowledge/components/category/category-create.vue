<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import CategoryEdit from './category-edit.vue'

const isOpen = ref(false)
</script>

<template>
  <UiButton @click="isOpen = true">
    <PlusIcon />
    新建知识分类
  </UiButton>

  <!-- CategoryEdit 自带 FormSheet 响应式外壳 -->
  <CategoryEdit v-model:open="isOpen" @close="isOpen = false" />
</template>
