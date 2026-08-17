<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { useLazyMount } from '@/composables/use-lazy-mount'

import StaffEdit from './staff-edit.vue'

const isOpen = ref(false)

const isOpenRendered = useLazyMount(isOpen)
</script>

<template>
  <UiButton @click="isOpen = true">
    <PlusIcon />
    新建人员
  </UiButton>

  <!-- StaffEdit 自带 FormSheet 响应式外壳 -->
  <StaffEdit v-if="isOpenRendered" v-model:open="isOpen" @close="isOpen = false" />
</template>
