<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const items = [
  {
    icon: 'lucide:bot',
    titleKey: 'marketing.ai.item1.title',
    descriptionKey: 'marketing.ai.item1.description',
  },
  {
    icon: 'lucide:headset',
    titleKey: 'marketing.ai.item2.title',
    descriptionKey: 'marketing.ai.item2.description',
  },
  {
    icon: 'lucide:boxes',
    titleKey: 'marketing.ai.item3.title',
    descriptionKey: 'marketing.ai.item3.description',
  },
  {
    icon: 'lucide:sparkles',
    titleKey: 'marketing.ai.item4.title',
    descriptionKey: 'marketing.ai.item4.description',
  },
]
</script>

<template>
  <section id="ai" class="scroll-mt-20">
    <h2 class="text-3xl lg:text-4xl font-bold text-center text-balance">
      {{ $t('marketing.ai.title') }}
    </h2>
    <p class="text-center text-muted-foreground mt-3 mb-8">
      {{ $t('marketing.ai.subtitle') }}
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UiCard v-for="item in items" :key="item.titleKey" class="p-6">
        <div class="flex items-start gap-3">
          <div class="w-fit rounded-lg border p-2 shrink-0">
            <Icon :icon="item.icon" class="size-5" />
          </div>
          <div>
            <h3 class="text-lg font-semibold">
              {{ $t(item.titleKey) }}
            </h3>
            <p class="text-sm text-muted-foreground mt-2 leading-relaxed">
              {{ $t(item.descriptionKey) }}
            </p>
          </div>
        </div>
      </UiCard>
    </div>
  </section>
</template>
