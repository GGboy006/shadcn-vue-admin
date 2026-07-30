<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Modal, ModalContent, ModalTrigger } from '@/components/prop-ui/modal'

import DynamicEdit from './dynamic-edit.vue'

const isOpen = ref(false)
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalTrigger as-child>
      <UiButton>
        <PlusIcon />
        新建小区动态
      </UiButton>
    </ModalTrigger>

    <ModalContent>
      <DynamicEdit @close="isOpen = false" />
    </ModalContent>
  </Modal>
</template>
