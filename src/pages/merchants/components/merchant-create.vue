<script lang="ts" setup>
import { UserRoundPlusIcon } from '@lucide/vue'

import type { MerchantType } from '@/services/api/merchant.api'

import { merchantTypeConfig } from '@/services/api/merchant.api'

import MerchantEdit from './merchant-edit.vue'

const { type } = defineProps<{
  /** 所在页面固定的类型 */
  type: MerchantType
}>()

const isOpen = ref(false)

const typeLabel = computed(() => merchantTypeConfig[type]?.label || '商户/物业')
</script>

<template>
  <UiButton @click="isOpen = true">
    <UserRoundPlusIcon />
    新建{{ typeLabel }}
  </UiButton>

  <!-- MerchantEdit 自带 FormSheet 响应式外壳 -->
  <MerchantEdit v-model:open="isOpen" :type="type" @close="isOpen = false" />
</template>
