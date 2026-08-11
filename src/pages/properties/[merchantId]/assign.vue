<script setup lang="ts">
// 物业「分配AI工具」入口:复用商户分配页组件。
// 独立路由 /properties/:merchantId/assign,使侧边栏高亮「物业管理」而非「商户管理」。
import MerchantAssignPage from '../../merchants/[merchantId].vue'
</script>

<template>
  <MerchantAssignPage />
</template>
