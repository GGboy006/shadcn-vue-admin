<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useLazyMount } from '@/composables/use-lazy-mount'

import CommitteeFormSheet from './committee-form-sheet.vue'

const isOpen = ref(false)

const isOpenRendered = useLazyMount(isOpen)
</script>

<template>
  <Button @click="isOpen = true">
    <PlusIcon />
    新建居委会
  </Button>

  <CommitteeFormSheet v-if="isOpenRendered" v-model:open="isOpen" />
</template>
