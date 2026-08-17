<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useLazyMount } from '@/composables/use-lazy-mount'

import GuideFormSheet from './guide-form-sheet.vue'

const isOpen = ref(false)

const isOpenRendered = useLazyMount(isOpen)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建指南
  </Button>

  <GuideFormSheet v-if="isOpenRendered" v-model:open="isOpen" />
</template>
