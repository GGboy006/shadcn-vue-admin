<script setup lang="ts">
import { MailPlusIcon } from '@lucide/vue'

import { Modal, ModalClose, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, ModalTrigger, useModal } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'

import UserInviteForm from './user-invite-form.vue'

const { isDesktop } = useModal()
const isOpen = ref(false)
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalTrigger as-child>
      <Button variant="outline">
        <MailPlusIcon />
        邀请用户
      </Button>
    </ModalTrigger>

    <ModalContent>
      <ModalHeader>
        <ModalTitle as-child>
          <div class="flex items-center gap-2">
            <MailPlusIcon />
            <span>邀请用户</span>
          </div>
        </ModalTitle>
        <ModalDescription>
          通过邮件邀请新用户加入团队，并为其分配角色以定义访问权限。
        </ModalDescription>
      </ModalHeader>

      <UserInviteForm />

      <ModalFooter v-if="!isDesktop" class="pt-2">
        <ModalClose as-child>
          <Button variant="outline">
            取消
          </Button>
        </ModalClose>
      </ModalFooter>
    </ModalContent>
  </Modal>
</template>
