<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useLazyMount } from '@/composables/use-lazy-mount'

import GovFormSheet from '../../components/gov-form-sheet.vue'
import MediatorForm from './mediator-form.vue'

const isOpen = ref(false)
const rendered = useLazyMount(isOpen)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新增调解员
  </Button>
  <GovFormSheet v-if="rendered" v-model:open="isOpen" title="新增调解员">
    <MediatorForm v-if="isOpen" @close="isOpen = false" />
  </GovFormSheet>
</template>
