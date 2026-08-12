<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import ArticleEdit from './article-edit.vue'

const props = defineProps<{
  /** 钻取页传入:锁定分类新建 */
  lockCategoryId?: number
}>()

const isOpen = ref(false)
</script>

<template>
  <UiButton @click="isOpen = true">
    <PlusIcon />
    新建知识文章
  </UiButton>

  <!-- ArticleEdit 自带 FormSheet 响应式外壳 -->
  <ArticleEdit v-model:open="isOpen" :lock-category-id="props.lockCategoryId" @close="isOpen = false" />
</template>
