<script lang="ts" setup>
import { UserRoundPlusIcon } from '@lucide/vue'

import { Modal, ModalContent, ModalTrigger } from '@/components/prop-ui/modal'

import UserResource from './user-resource.vue'

const isOpen = ref(false)
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalTrigger as-child>
      <UiButton>
        <UserRoundPlusIcon />
        新建用户
      </UiButton>
    </ModalTrigger>

    <ModalContent>
      <UserResource @close="isOpen = false" />
    </ModalContent>
  </Modal>
</template>
