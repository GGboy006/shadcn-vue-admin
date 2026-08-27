<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const roles = [
  {
    icon: 'lucide:layout-dashboard',
    titleKey: 'marketing.roles.station.title',
    descriptionKey: 'marketing.roles.station.description',
  },
  {
    icon: 'lucide:store',
    titleKey: 'marketing.roles.merchant.title',
    descriptionKey: 'marketing.roles.merchant.description',
  },
  {
    icon: 'lucide:landmark',
    titleKey: 'marketing.roles.committee.title',
    descriptionKey: 'marketing.roles.committee.description',
  },
]
</script>

<template>
  <section id="roles" class="scroll-mt-20">
    <h2 class="text-3xl lg:text-4xl font-bold text-center">
      {{ $t('marketing.roles.title') }}
    </h2>
    <p class="text-center text-muted-foreground mt-3 mb-8">
      {{ $t('marketing.roles.subtitle') }}
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UiCard v-for="role in roles" :key="role.titleKey" class="p-6">
        <div class="w-fit rounded-lg border p-2 mb-4">
          <Icon :icon="role.icon" class="size-5" />
        </div>
        <h3 class="text-xl font-semibold">
          {{ $t(role.titleKey) }}
        </h3>
        <p class="text-sm text-muted-foreground mt-2 leading-relaxed">
          {{ $t(role.descriptionKey) }}
        </p>
      </UiCard>
    </div>
  </section>
</template>
