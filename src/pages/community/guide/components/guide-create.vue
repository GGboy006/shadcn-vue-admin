<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import GuideFormSheet from './guide-form-sheet.vue'

const isOpen = ref(false)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建指南
  </Button>

  <GuideFormSheet v-model:open="isOpen" />
</template>
