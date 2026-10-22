<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useLazyMount } from '@/composables/use-lazy-mount'

import GovFormSheet from '../../components/gov-form-sheet.vue'
import PointGoodsForm from './point-goods-form.vue'

const isOpen = ref(false)
const rendered = useLazyMount(isOpen)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新增商品
  </Button>
  <GovFormSheet v-if="rendered" v-model:open="isOpen" title="新增商品">
    <PointGoodsForm v-if="isOpen" @close="isOpen = false" />
  </GovFormSheet>
</template>
