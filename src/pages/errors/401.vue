<script setup lang="ts">
import Error from '@/components/custom-error.vue'
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <Error
      :code="401"
      subtitle="未授权"
      error="您没有权限访问此页面。"
    />
  </div>
</template>

<route lang="yaml">
meta:
  layout: blank
</route>
