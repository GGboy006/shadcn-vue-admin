<script lang="ts" setup>
import { UserRoundPlusIcon } from '@lucide/vue'

import type { MerchantType } from '@/services/api/merchant.api'

import { Modal, ModalContent, ModalTrigger } from '@/components/prop-ui/modal'
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
  <Modal v-model:open="isOpen">
    <ModalTrigger as-child>
      <UiButton>
        <UserRoundPlusIcon />
        新建{{ typeLabel }}
      </UiButton>
    </ModalTrigger>

    <ModalContent>
      <MerchantEdit :type="type" @close="isOpen = false" />
    </ModalContent>
  </Modal>
</template>
