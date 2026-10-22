<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'

import AffairCreate from './components/affair-create.vue'
import AffairPanel from './components/affair-panel.vue'
</script>

<template>
  <BasicPage title="村民议事" description="登记议题、投票选项和办理结果" sticky>
    <template #actions>
      <AffairCreate />
    </template>

    <AffairPanel />
  </BasicPage>
</template>
