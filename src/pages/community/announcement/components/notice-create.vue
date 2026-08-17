<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { useLazyMount } from '@/composables/use-lazy-mount'

import NoticeEdit from './notice-edit.vue'

const isOpen = ref(false)

const isOpenRendered = useLazyMount(isOpen)
</script>

<template>
  <UiButton @click="isOpen = true">
    <PlusIcon />
    新建小区公告
  </UiButton>

  <!-- NoticeEdit 自带 FormSheet 响应式外壳 -->
  <NoticeEdit v-if="isOpenRendered" v-model:open="isOpen" @close="isOpen = false" />
</template>
