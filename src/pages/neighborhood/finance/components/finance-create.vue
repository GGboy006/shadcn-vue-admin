<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useLazyMount } from '@/composables/use-lazy-mount'

import GovFormSheet from '../../components/gov-form-sheet.vue'
import FinanceForm from './finance-form.vue'

const isOpen = ref(false)
const rendered = useLazyMount(isOpen)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新增月度账目
  </Button>
  <GovFormSheet v-if="rendered" v-model:open="isOpen" title="新增月度账目">
    <FinanceForm v-if="isOpen" @close="isOpen = false" />
  </GovFormSheet>
</template>
