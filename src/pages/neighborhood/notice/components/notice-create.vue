<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import NoticeFormSheet from './notice-form-sheet.vue'

const isOpen = ref(false)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建居委会公告
  </Button>

  <NoticeFormSheet v-model:open="isOpen" />
</template>
