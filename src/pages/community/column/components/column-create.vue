<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import ColumnFormSheet from './column-form-sheet.vue'

const isOpen = ref(false)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建栏目
  </Button>

  <ColumnFormSheet v-model:open="isOpen" />
</template>
