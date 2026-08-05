<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import ServiceGuideFormSheet from './service-guide-form-sheet.vue'

const isOpen = ref(false)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建服务热线
  </Button>

  <ServiceGuideFormSheet v-model:open="isOpen" />
</template>
