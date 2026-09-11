<script setup lang="ts">
import { computed } from 'vue'

import type { HotelOffer, PoiOffer } from '@/utils/feizhu'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import FlyCover from './fly-cover.vue'

const props = defineProps<{
  kind: 'hotel' | 'poi'
  item: HotelOffer | PoiOffer
  index: number
  total: number
}>()

const hotel = computed(() => props.kind === 'hotel' ? props.item as HotelOffer : null)
const poi = computed(() => props.kind === 'poi' ? props.item as PoiOffer : null)

const tags = computed(() => {
  if (hotel.value) {
    return [hotel.value.scoreText, hotel.value.star].filter(Boolean).slice(0, 3)
  }
  return [poi.value?.ticketName].filter((item): item is string => Boolean(item))
})

const addressLine = computed(() => {
  if (hotel.value) {
    return [hotel.value.address, hotel.value.poiHint || hotel.value.review].filter(Boolean).join(' · ')
  }
  const extra = poi.value?.freeHint || (poi.value?.dateText ? `票价日期 ${poi.value.dateText}` : '')
  return [poi.value?.address, extra].filter(Boolean).join(' · ')
})

const cta = computed(() => props.kind === 'poi' ? '购票' : '预订')
</script>

<template>
  <article class="min-w-0 max-w-full overflow-hidden rounded-xl border bg-background text-foreground">
    <div class="relative">
      <FlyCover :src="props.item.coverUrl" :alt="props.item.name" />
      <span
        v-if="props.total > 1"
        class="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white"
      >
        {{ props.index + 1 }}/{{ props.total }}
      </span>
    </div>
    <div class="space-y-2 p-3">
      <p class="line-clamp-2 font-semibold">
        {{ props.item.name }}
      </p>
      <div v-if="tags.length" class="flex flex-wrap gap-1">
        <Badge
          v-for="tag in tags"
          :key="tag"
          variant="secondary"
        >
          {{ tag }}
        </Badge>
      </div>
      <p
        v-if="addressLine"
        class="line-clamp-2 text-xs text-muted-foreground"
      >
        {{ addressLine }}
      </p>
      <div class="flex items-center justify-between gap-2 pt-1">
        <span class="text-sm font-semibold text-orange-600 dark:text-orange-400">
          {{ props.item.priceText || (props.kind === 'poi' ? '查看票价' : '查看价格') }}
        </span>
        <Button
          as="a"
          size="sm"
          :href="props.item.jumpUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ cta }}
        </Button>
      </div>
    </div>
  </article>
</template>
