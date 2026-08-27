<script lang="ts" setup>
import Ai from '@/components/marketing/ai.vue'
import Evaluation from '@/components/marketing/evaluation.vue'
import Features from '@/components/marketing/features.vue'
import Hero from '@/components/marketing/hero.vue'
import Logos from '@/components/marketing/logos.vue'
import PricingPlans from '@/components/marketing/pricing-plans/index.vue'
import Setup from '@/components/marketing/setup.vue'
</script>

<template>
  <div class="flex flex-col gap-18 pb-16">
    <Hero />
    <Logos />
    <Features />
    <Ai />
    <Evaluation />
    <PricingPlans />
    <Setup />
  </div>
</template>

<route lang="yaml">
meta:
  layout: marketing
  auth: false
</route>
