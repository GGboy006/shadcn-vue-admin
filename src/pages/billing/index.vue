<script lang="ts" setup>
import { BasicPage } from '@/components/global-layout'

import BillingHistory from './components/billing-history/index.vue'
import BillingPlan from './components/billing-plan/index.vue'
</script>

<template>
  <BasicPage
    title="套餐与计费"
    description="在此管理您的套餐和计费历史。"
  >
    <BillingPlan />
    <BillingHistory class="mt-2" />
  </BasicPage>
</template>
