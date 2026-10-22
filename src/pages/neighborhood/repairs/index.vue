<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'

import RepairCreate from './components/repair-create.vue'
import RepairPanel from './components/repair-panel.vue'
</script>

<template>
  <BasicPage title="报事报修" description="受理和跟进居民报事报修" sticky>
    <template #actions>
      <RepairCreate />
    </template>

    <RepairPanel />
  </BasicPage>
</template>
