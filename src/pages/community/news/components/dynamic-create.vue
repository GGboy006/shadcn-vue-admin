<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { useLazyMount } from '@/composables/use-lazy-mount'

import DynamicEdit from './dynamic-edit.vue'

const isOpen = ref(false)

const isOpenRendered = useLazyMount(isOpen)
</script>

<template>
  <UiButton @click="isOpen = true">
    <PlusIcon />
    新建小区动态
  </UiButton>

  <!-- DynamicEdit 自带 FormSheet 响应式外壳 -->
  <DynamicEdit v-if="isOpenRendered" v-model:open="isOpen" @close="isOpen = false" />
</template>
