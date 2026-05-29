<script setup lang="ts">
import { ArrowLeftIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const merchantId = computed(() => (route.params as Record<string, string>).merchantId)
</script>

<template>
  <div class="p-6">
    <Button variant="ghost" size="sm" @click="router.back()">
      <ArrowLeftIcon class="size-4 mr-1" />
      返回
    </Button>

    <div class="mt-6">
      <h1 class="text-2xl font-bold">
        商户/物业详情
      </h1>
      <p class="mt-2 text-muted-foreground">
        商户ID: {{ merchantId }}
      </p>
    </div>
  </div>
</template>
