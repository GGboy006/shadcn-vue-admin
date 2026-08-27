<script lang="ts" setup>
import { useColorMode } from '@vueuse/core'

import SignInButton from '@/components/sign-in-button.vue'
import ToggleTheme from '@/components/toggle-theme.vue'
import { isMerchantBusinessUser, UserType } from '@/constants/user-type'
import { useAuthStore } from '@/stores/auth'
import { withBase } from '@/utils/with-base'

const mode = useColorMode()
const authStore = useAuthStore()

const navItems = [
  { hash: '#roles', key: 'marketing.nav.roles' },
  { hash: '#features', key: 'marketing.nav.features' },
  { hash: '#ai', key: 'marketing.nav.ai' },
  { hash: '#access', key: 'marketing.nav.access' },
] as const

const homePath = computed(() => {
  const userType = authStore.userInfo?.userType
  if (userType === UserType.committee)
    return '/neighborhood/home'
  if (isMerchantBusinessUser(userType))
    return '/merchant-business/overview'
  return '/dashboard'
})
</script>

<template>
  <header class="h-14 flex items-center gap-4 marketing-header sticky top-0 z-99">
    <router-link to="/marketing" class="flex items-center gap-2 shrink-0">
      <UiAvatar>
        <UiAvatarImage :src="withBase(mode === 'dark' ? '/logo.svg' : '/logo-black.svg')" alt="Logo" />
      </UiAvatar>
      <span class="text-base font-bold">{{ $t('marketing.brand') }}</span>
    </router-link>

    <nav class="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
      <a
        v-for="item in navItems"
        :key="item.hash"
        :href="item.hash"
        class="hover:text-foreground transition-colors"
      >
        {{ $t(item.key) }}
      </a>
    </nav>

    <div class="flex-1" />

    <div class="flex items-center gap-2">
      <UiButton variant="ghost" as-child class="hidden sm:inline-flex">
        <a href="#access">{{ $t('marketing.apply') }}</a>
      </UiButton>
      <UiButton v-if="authStore.isLogin" as-child>
        <router-link :to="homePath">
          {{ $t('marketing.enter') }}
        </router-link>
      </UiButton>
      <SignInButton v-else />
      <ToggleTheme />
    </div>
  </header>
</template>

<style scoped>
.marketing-header {
  backdrop-filter: saturate(50%) blur(4px);
  background-size: 4px 4px;
}
</style>
