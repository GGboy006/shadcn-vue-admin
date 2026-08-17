<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useLazyMount } from '@/composables/use-lazy-mount'

import ServiceGuideFormSheet from './service-guide-form-sheet.vue'

const isOpen = ref(false)

const isOpenRendered = useLazyMount(isOpen)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建服务热线
  </Button>

  <ServiceGuideFormSheet v-if="isOpenRendered" v-model:open="isOpen" />
</template>
