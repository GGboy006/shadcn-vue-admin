<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useLazyMount } from '@/composables/use-lazy-mount'

import GovFormSheet from '../../components/gov-form-sheet.vue'
import ElderVisitorForm from './elder-visitor-form.vue'

const isOpen = ref(false)
const rendered = useLazyMount(isOpen)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新增探访志愿者
  </Button>
  <GovFormSheet v-if="rendered" v-model:open="isOpen" title="新增探访志愿者">
    <ElderVisitorForm v-if="isOpen" @close="isOpen = false" />
  </GovFormSheet>
</template>
