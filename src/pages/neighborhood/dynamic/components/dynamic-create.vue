<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import DynamicFormSheet from './dynamic-form-sheet.vue'

const isOpen = ref(false)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建资讯动态
  </Button>

  <DynamicFormSheet v-model:open="isOpen" />
</template>
