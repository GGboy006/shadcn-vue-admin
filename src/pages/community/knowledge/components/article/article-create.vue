<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { useLazyMount } from '@/composables/use-lazy-mount'

import ArticleEdit from './article-edit.vue'

const props = defineProps<{
  /** 钻取页传入:锁定分类新建 */
  lockCategoryId?: string
}>()

const isOpen = ref(false)

const isOpenRendered = useLazyMount(isOpen)
</script>

<template>
  <UiButton @click="isOpen = true">
    <PlusIcon />
    新建知识文章
  </UiButton>

  <!-- ArticleEdit 自带 FormSheet 响应式外壳 -->
  <ArticleEdit v-if="isOpenRendered" v-model:open="isOpen" :lock-category-id="props.lockCategoryId" @close="isOpen = false" />
</template>
