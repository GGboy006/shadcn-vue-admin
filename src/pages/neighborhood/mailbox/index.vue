<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'

import MailPanel from './components/mail-panel.vue'
</script>

<template>
  <BasicPage title="书记信箱" description="回复和办结居民来信，不能代写来信" sticky>
    <MailPanel />
  </BasicPage>
</template>
