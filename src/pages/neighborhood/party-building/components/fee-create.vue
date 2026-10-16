<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useLazyMount } from '@/composables/use-lazy-mount'

import GovFormSheet from '../../components/gov-form-sheet.vue'
import FeeForm from './fee-form.vue'

const isOpen = ref(false)
const rendered = useLazyMount(isOpen)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新增季度
  </Button>
  <GovFormSheet v-if="rendered" v-model:open="isOpen" title="新增季度">
    <FeeForm v-if="isOpen" @close="isOpen = false" />
  </GovFormSheet>
</template>
