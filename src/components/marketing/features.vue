<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'

import GlowingEffect from '@/components/inspira-ui/glowing-effect.vue'

const { t } = useI18n()

const gridItems = computed(() => [
  {
    icon: 'lucide:chart-column',
    title: t('marketing.features.feature1.title'),
    description: t('marketing.features.feature1.description'),
  },
  {
    icon: 'lucide:building-2',
    title: t('marketing.features.feature2.title'),
    description: t('marketing.features.feature2.description'),
  },
  {
    icon: 'lucide:life-buoy',
    title: t('marketing.features.feature3.title'),
    description: t('marketing.features.feature3.description'),
  },
  {
    icon: 'lucide:store',
    title: t('marketing.features.feature4.title'),
    description: t('marketing.features.feature4.description'),
  },
])
</script>

<template>
  <section id="features" class="scroll-mt-20">
    <h2 class="text-3xl lg:text-4xl font-bold text-center mb-8">
      {{ $t('marketing.features.title') }}
    </h2>

    <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <li
        v-for="item in gridItems"
        :key="item.title"
        class="min-h-[14rem] list-none"
      >
        <div class="rounded-2.5xl relative h-full border p-2 md:rounded-3xl md:p-3">
          <GlowingEffect
            :spread="40"
            :glow="true"
            :disabled="false"
            :proximity="64"
            :inactive-zone="0.01"
          />
          <div
            class="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]"
          >
            <div class="relative flex flex-1 flex-col justify-between gap-3">
              <div class="w-fit rounded-lg border border-gray-600 p-2">
                <Icon
                  class="size-4 text-black dark:text-neutral-400"
                  :icon="item.icon"
                />
              </div>
              <div class="space-y-3">
                <h3 class="text-xl font-semibold md:text-2xl">
                  {{ item.title }}
                </h3>
                <p class="text-sm md:text-base text-muted-foreground">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>
