<script setup lang="ts">
import Error from '@/components/custom-error.vue'
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <Error
      :code="404"
      subtitle="页面未找到"
      error="您访问的页面可能已被删除、名称已更改或暂时不可用。"
    />
  </div>
</template>

<route lang="yaml">
meta:
  layout: blank
  </route>
