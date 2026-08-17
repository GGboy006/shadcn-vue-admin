<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useLazyMount } from '@/composables/use-lazy-mount'

import BannerFormSheet from './banner-form-sheet.vue'

const isOpen = ref(false)

const isOpenRendered = useLazyMount(isOpen)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建广告
  </Button>

  <BannerFormSheet v-if="isOpenRendered" v-model:open="isOpen" />
</template>
