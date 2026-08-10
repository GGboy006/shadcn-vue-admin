<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import PhoneFormSheet from './phone-form-sheet.vue'

const isOpen = ref(false)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建电话
  </Button>

  <PhoneFormSheet v-model:open="isOpen" />
</template>
