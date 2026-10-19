<script setup lang="ts">
import { ensureHousekeeperKind, housekeeperKind } from '@/services/api/housekeeper-partner.access'
import { useAuthStore } from '@/stores/auth'

const kind = housekeeperKind()
const pending = ref(!kind.value)
const authStore = useAuthStore()

onMounted(async () => {
  if (kind.value) {
    pending.value = false
    return
  }
  pending.value = true
  try {
    await ensureHousekeeperKind(authStore.token)
  }
  finally {
    pending.value = false
  }
})
</script>

<template>
  <p v-if="pending" class="p-4 text-sm text-muted-foreground">
    正在确认账号...
  </p>
  <slot v-else :kind="kind || 'local'" />
</template>
