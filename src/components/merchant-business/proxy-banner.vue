<script setup lang="ts">
import { ArrowLeftIcon, StoreIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useUserInfoStore } from '@/stores/user-info'
import { isProxyTab } from '@/utils/proxy-auth'

const userInfoStore = useUserInfoStore()

/** 仅代客标签页显示(新标签页换商户 token 场景) */
const visible = computed(() => isProxyTab())

const merchantName = computed(() => userInfoStore.merchantInfo?.merchantName ?? '')

function handleClose() {
  // 关闭代客标签页,sessionStorage 随之销毁,商户 token 自动清除
  window.close()
}
</script>

<template>
  <div
    v-if="visible"
    class="flex items-center gap-2 border-b bg-amber-50 dark:bg-amber-950/30 px-4 py-2 text-sm text-amber-900 dark:text-amber-100"
  >
    <StoreIcon class="size-4 shrink-0" />
    <span class="truncate">
      当前代客操作商户:<span class="font-medium">{{ merchantName || '未知商户' }}</span>
    </span>
    <div class="ml-auto">
      <Button variant="outline" size="sm" class="h-7" @click="handleClose">
        <ArrowLeftIcon class="size-3.5" />
        关闭标签页返回
      </Button>
    </div>
  </div>
</template>
