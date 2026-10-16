<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useLazyMount } from '@/composables/use-lazy-mount'

import GovFormSheet from '../../components/gov-form-sheet.vue'
import ActivityForm from './activity-form.vue'

const isOpen = ref(false)
const rendered = useLazyMount(isOpen)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新增活动
  </Button>
  <GovFormSheet v-if="rendered" v-model:open="isOpen" title="新增活动">
    <ActivityForm v-if="isOpen" @close="isOpen = false" />
  </GovFormSheet>
</template>
