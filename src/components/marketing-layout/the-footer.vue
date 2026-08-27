<script lang="ts" setup>
import { useColorMode } from '@vueuse/core'

import { withBase } from '@/utils/with-base'

const mode = useColorMode()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="min-h-18 flex items-center justify-between gap-4 py-6 text-sm text-muted-foreground">
    <router-link to="/marketing" class="flex items-center gap-2 text-foreground">
      <UiAvatar class="size-8">
        <UiAvatarImage :src="withBase(mode === 'dark' ? '/logo.svg' : '/logo-black.svg')" alt="Logo" />
      </UiAvatar>
      <span class="font-medium">{{ $t('marketing.brand') }}</span>
    </router-link>

    <div>© {{ year }} {{ $t('marketing.footer.copy') }}</div>
  </footer>
</template>
