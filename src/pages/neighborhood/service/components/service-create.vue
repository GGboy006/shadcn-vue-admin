<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import ServiceFormSheet from './service-form-sheet.vue'

const isOpen = ref(false)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建服务
  </Button>

  <ServiceFormSheet v-model:open="isOpen" />
</template>
