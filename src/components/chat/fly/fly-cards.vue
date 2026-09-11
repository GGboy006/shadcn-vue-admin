<script setup lang="ts">
import { computed } from 'vue'

import type { FlyCardsAfterText } from '@/utils/feizhu'

import { hasFlyCards } from '@/utils/feizhu'

import FlyCarousel from './fly-carousel.vue'
import TrainCard from './train-card.vue'

const props = defineProps<{
  cards?: FlyCardsAfterText | null
}>()

const show = computed(() => hasFlyCards(props.cards))
</script>

<template>
  <div
    v-if="show && props.cards"
    class="mt-3 flex min-w-0 w-full max-w-full flex-col gap-3"
  >
    <TrainCard
      v-for="trip in props.cards.trains"
      :key="trip.jumpUrl"
      :trip="trip"
    />
    <FlyCarousel
      v-if="props.cards.hotels.length"
      kind="hotel"
      :items="props.cards.hotels"
    />
    <FlyCarousel
      v-if="props.cards.pois.length"
      kind="poi"
      :items="props.cards.pois"
    />
  </div>
</template>
