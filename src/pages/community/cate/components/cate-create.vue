<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useLazyMount } from '@/composables/use-lazy-mount'

import CateFormSheet from './cate-form-sheet.vue'

const isOpen = ref(false)

const isOpenRendered = useLazyMount(isOpen)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建分类
  </Button>

  <CateFormSheet v-if="isOpenRendered" v-model:open="isOpen" />
</template>
