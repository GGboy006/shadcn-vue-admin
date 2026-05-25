<script setup lang="ts">
import Error from '@/components/custom-error.vue'
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <Error
      :code="500"
      subtitle="服务器内部错误"
      error="服务器遇到了意外情况，无法完成请求。"
    />
  </div>
</template>

<route lang="yaml">
meta:
  layout: blank
  </route>
