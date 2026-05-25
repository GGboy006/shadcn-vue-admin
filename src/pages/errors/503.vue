<script setup lang="ts">
import Error from '@/components/custom-error.vue'
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <Error
      :code="503"
      subtitle="服务不可用"
      error="由于服务器临时过载或维护，服务器目前无法处理请求。"
    />
  </div>
</template>

<route lang="yaml">
meta:
  layout: blank
  </route>
