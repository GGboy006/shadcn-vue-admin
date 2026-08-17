<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { useLazyMount } from '@/composables/use-lazy-mount'

import CategoryEdit from './category-edit.vue'

const isOpen = ref(false)

const isOpenRendered = useLazyMount(isOpen)
</script>

<template>
  <UiButton @click="isOpen = true">
    <PlusIcon />
    新建分类
  </UiButton>

  <!-- CategoryEdit 自带 FormSheet 响应式外壳 -->
  <CategoryEdit v-if="isOpenRendered" v-model:open="isOpen" @close="isOpen = false" />
</template>
