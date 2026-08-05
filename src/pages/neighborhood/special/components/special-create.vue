<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import SpecialFormSheet from './special-form-sheet.vue'

const isOpen = ref(false)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建专题
  </Button>

  <SpecialFormSheet v-model:open="isOpen" />
</template>
