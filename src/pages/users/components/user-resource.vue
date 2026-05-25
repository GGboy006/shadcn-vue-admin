<script lang="ts" setup>
import { ModalDescription, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'

import type { User } from '../data/schema'

import UserForm from './user-form.vue'

const props = defineProps<{
  user?: User
}>()
defineEmits(['close'])

const user = computed(() => props.user)
const title = computed(() => user.value?.id ? `编辑用户` : '新建用户')
const description = computed(() => user.value?.id ? `编辑用户 ${user.value.username}` : '创建新用户账号')
</script>

<template>
  <div>
    <ModalHeader>
      <ModalTitle>
        {{ title }}
      </ModalTitle>
      <ModalDescription>
        {{ description }}
      </ModalDescription>
    </ModalHeader>

    <UserForm :user="user" @close="$emit('close')" />
  </div>
</template>
