<script lang="ts" setup>
const steps = [
  {
    index: '01',
    titleKey: 'marketing.scenarios.s1.title',
    descriptionKey: 'marketing.scenarios.s1.description',
  },
  {
    index: '02',
    titleKey: 'marketing.scenarios.s2.title',
    descriptionKey: 'marketing.scenarios.s2.description',
  },
  {
    index: '03',
    titleKey: 'marketing.scenarios.s3.title',
    descriptionKey: 'marketing.scenarios.s3.description',
  },
]
</script>

<template>
  <section id="scenarios" class="scroll-mt-20">
    <h2 class="text-3xl lg:text-4xl font-bold text-center">
      {{ $t('marketing.scenarios.title') }}
    </h2>
    <p class="text-center text-muted-foreground mt-3 mb-8">
      {{ $t('marketing.scenarios.subtitle') }}
    </p>

    <ol class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <li v-for="step in steps" :key="step.titleKey">
        <UiCard class="p-6 h-full">
          <p class="text-sm font-mono text-muted-foreground">
            {{ step.index }}
          </p>
          <h3 class="text-xl font-semibold mt-3">
            {{ $t(step.titleKey) }}
          </h3>
          <p class="text-sm text-muted-foreground mt-2 leading-relaxed">
            {{ $t(step.descriptionKey) }}
          </p>
        </UiCard>
      </li>
    </ol>
  </section>
</template>
