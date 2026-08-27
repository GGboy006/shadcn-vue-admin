<script lang="ts" setup>
import { Icon } from '@iconify/vue'

import ApplyForm from '@/components/marketing/apply-form.vue'

const cards = [
  {
    icon: 'lucide:key-round',
    titleKey: 'marketing.access.open.title',
    descriptionKey: 'marketing.access.open.description',
  },
  {
    icon: 'lucide:users',
    titleKey: 'marketing.access.roles.title',
    descriptionKey: 'marketing.access.roles.description',
  },
  {
    icon: 'lucide:arrow-right',
    titleKey: 'marketing.access.next.title',
    descriptionKey: 'marketing.access.next.description',
    highlight: true,
  },
]
</script>

<template>
  <section id="access" class="scroll-mt-20">
    <h2 class="text-center font-bold text-3xl lg:text-4xl">
      {{ $t('marketing.access.title') }}
    </h2>
    <p class="text-center text-muted-foreground mt-3 mb-8 max-w-2xl mx-auto">
      {{ $t('marketing.access.subtitle') }}
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UiCard
        v-for="card in cards"
        :key="card.titleKey"
        class="p-6"
        :class="card.highlight ? 'border-primary bg-primary/5' : ''"
      >
        <div class="w-fit rounded-lg border p-2 mb-4">
          <Icon :icon="card.icon" class="size-5" />
        </div>
        <h3 class="text-xl font-semibold">
          {{ $t(card.titleKey) }}
        </h3>
        <p class="text-sm text-muted-foreground mt-2 leading-relaxed">
          {{ $t(card.descriptionKey) }}
        </p>
      </UiCard>
    </div>

    <ApplyForm />
  </section>
</template>
