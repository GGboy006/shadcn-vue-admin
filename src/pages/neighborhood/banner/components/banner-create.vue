<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import BannerFormSheet from './banner-form-sheet.vue'

const isOpen = ref(false)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建广告
  </Button>

  <BannerFormSheet v-model:open="isOpen" />
</template>
