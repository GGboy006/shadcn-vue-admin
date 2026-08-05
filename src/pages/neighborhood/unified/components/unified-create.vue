<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import UnifiedFormSheet from './unified-form-sheet.vue'

const isOpen = ref(false)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建栏目
  </Button>

  <UnifiedFormSheet v-model:open="isOpen" />
</template>
