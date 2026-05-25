<script setup lang="ts">
import { BasicPage, TwoColAside, TwoColLayout } from '@/components/global-layout'

const { settingsNavItems } = useSidebar()
</script>

<template>
  <BasicPage
    title="设置"
    description="管理系统设置。"
  >
    <TwoColLayout>
      <template #aside>
        <TwoColAside :nav="settingsNavItems" />
      </template>

      <slot />
    </TwoColLayout>
  </BasicPage>
</template>
