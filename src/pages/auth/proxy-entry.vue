<script setup lang="ts">
import { useProxyEntry } from '@/composables/use-proxy-entry'

const route = useRoute()
const { consume } = useProxyEntry()

const status = ref<'loading' | 'error'>('loading')
const errorMsg = ref('')

onMounted(async () => {
  const key = route.query.k as string | undefined
  const result = await consume(key)
  if (!result.ok) {
    status.value = 'error'
    errorMsg.value = {
      'no-key': '代客参数缺失,请从商户列表重新进入',
      'timeout': '代客登录超时或失败,请关闭此标签页后重试',
      'fetch-info': '获取商户信息失败,请关闭此标签页后重试',
    }[result.reason]
  }
  // 成功时 consume 内已 router.replace 到商户概览
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <div v-if="status === 'loading'" class="flex flex-col items-center gap-3 text-muted-foreground">
      <div class="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span class="text-sm">正在进入商户后台...</span>
    </div>
    <div v-else class="flex max-w-sm flex-col items-center gap-2 text-center">
      <p class="text-sm text-destructive">
        {{ errorMsg }}
      </p>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: blank
</route>
