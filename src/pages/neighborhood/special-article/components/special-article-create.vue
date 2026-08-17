<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useLazyMount } from '@/composables/use-lazy-mount'

import SpecialArticleFormSheet from './special-article-form-sheet.vue'

const { specialCode } = defineProps<{
  /** 从路由 [specialCode] 取 */
  specialCode: string
}>()

const isOpen = ref(false)

const isOpenRendered = useLazyMount(isOpen)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建文章
  </Button>

  <SpecialArticleFormSheet v-if="isOpenRendered" v-model:open="isOpen" :special-code="specialCode" />
</template>
