<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import ActivityFormSheet from './activity-form-sheet.vue'

const isOpen = ref(false)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建活动
  </Button>

  <ActivityFormSheet v-model:open="isOpen" />
</template>
