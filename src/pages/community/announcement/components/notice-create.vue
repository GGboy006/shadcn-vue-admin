<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Modal, ModalContent, ModalTrigger } from '@/components/prop-ui/modal'

import NoticeEdit from './notice-edit.vue'

const isOpen = ref(false)
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalTrigger as-child>
      <UiButton>
        <PlusIcon />
        新建小区公告
      </UiButton>
    </ModalTrigger>

    <ModalContent>
      <NoticeEdit @close="isOpen = false" />
    </ModalContent>
  </Modal>
</template>
