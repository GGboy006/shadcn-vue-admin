<script setup lang="ts">
import type { HotelOffer, PoiOffer } from '@/utils/feizhu'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

import FlyOfferPage from './fly-offer-page.vue'

const props = defineProps<{
  kind: 'hotel' | 'poi'
  items: Array<HotelOffer | PoiOffer>
}>()
</script>

<template>
  <Carousel
    v-if="props.items.length"
    class="w-full min-w-0 max-w-full"
    :opts="{ align: 'start', skipSnaps: false }"
  >
    <CarouselContent class="-ml-3">
      <CarouselItem
        v-for="(item, index) in props.items"
        :key="item.jumpUrl"
        :class="props.items.length > 1 ? 'basis-[86%] pl-3' : 'basis-full pl-3'"
      >
        <FlyOfferPage
          :kind="props.kind"
          :item="item"
          :index="index"
          :total="props.items.length"
        />
      </CarouselItem>
    </CarouselContent>
    <CarouselPrevious
      v-if="props.items.length > 1"
      class="left-1 size-7 border-background/80 bg-background/90"
    />
    <CarouselNext
      v-if="props.items.length > 1"
      class="right-1 size-7 border-background/80 bg-background/90"
    />
  </Carousel>
</template>
