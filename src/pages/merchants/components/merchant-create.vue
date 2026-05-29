<script lang="ts" setup>
import { UserRoundPlusIcon } from '@lucide/vue'

import { Modal, ModalContent, ModalTrigger } from '@/components/prop-ui/modal'

import MerchantEdit from './merchant-edit.vue'

const isOpen = ref(false)
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalTrigger as-child>
      <UiButton>
        <UserRoundPlusIcon />
        新建商户/物业
      </UiButton>
    </ModalTrigger>

    <ModalContent>
      <MerchantEdit @close="isOpen = false" />
    </ModalContent>
  </Modal>
</template>
