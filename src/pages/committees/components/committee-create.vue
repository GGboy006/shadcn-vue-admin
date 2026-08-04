<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import CommitteeFormSheet from './committee-form-sheet.vue'

const isOpen = ref(false)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建居委会
  </Button>

  <CommitteeFormSheet v-model:open="isOpen" />
</template>
