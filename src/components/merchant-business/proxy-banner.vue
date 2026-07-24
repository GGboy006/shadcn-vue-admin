<script setup lang="ts">
import { ArrowLeftIcon, StoreIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useMerchantBusinessStore } from '@/stores/merchant-business'

const router = useRouter()
const authStore = useAuthStore()
const merchantBusinessStore = useMerchantBusinessStore()

/** 仅站长代客模式显示 */
const visible = computed(() => authStore.userInfo?.userType === 3 && merchantBusinessStore.proxyMode)

function handleBack() {
  // 退出代客:清状态 + 跳回商户列表,菜单自动重载为站长视角
  merchantBusinessStore.clear()
  router.push('/merchants')
}
</script>

<template>
  <div
    v-if="visible"
    class="flex items-center gap-2 border-b bg-amber-50 dark:bg-amber-950/30 px-4 py-2 text-sm text-amber-900 dark:text-amber-100"
  >
    <StoreIcon class="size-4 shrink-0" />
    <span class="truncate">
      当前操作商户:<span class="font-medium">{{ merchantBusinessStore.merchantName || '未知商户' }}</span>
    </span>
    <div class="ml-auto">
      <Button variant="outline" size="sm" class="h-7" @click="handleBack">
        <ArrowLeftIcon class="size-3.5" />
        返回商户列表
      </Button>
    </div>
  </div>
</template>
