<script setup lang="ts">
import type { TrainTrip } from '@/utils/feizhu'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  trip: TrainTrip
}>()
</script>

<template>
  <article class="min-w-0 max-w-full overflow-hidden rounded-xl border bg-background p-3 text-foreground">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="truncate font-semibold">
          {{ props.trip.trainNo }}
        </p>
        <p class="mt-0.5 truncate text-xs text-muted-foreground">
          {{ [props.trip.transportName, props.trip.seatClass, props.trip.dateText].filter(Boolean).join(' · ') }}
        </p>
      </div>
      <Badge
        v-if="props.trip.journeyType"
        :variant="props.trip.journeyType.includes('直达') ? 'success' : 'secondary'"
      >
        {{ props.trip.journeyType }}
      </Badge>
    </div>

    <div class="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
      <div class="min-w-0">
        <p class="font-medium tabular-nums">
          {{ props.trip.depTime || '--:--' }}
        </p>
        <p class="truncate text-xs text-muted-foreground">
          {{ props.trip.depStation }}
        </p>
      </div>
      <div class="px-1 text-center text-[11px] text-muted-foreground">
        <p>{{ props.trip.durationText }}</p>
        <p v-if="props.trip.transferText">
          {{ props.trip.transferText }}
        </p>
        <p v-if="props.trip.plusDay">
          +1 天
        </p>
      </div>
      <div class="min-w-0 text-right">
        <p class="font-medium tabular-nums">
          {{ props.trip.arrTime || '--:--' }}
        </p>
        <p class="truncate text-xs text-muted-foreground">
          {{ props.trip.arrStation }}
        </p>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between gap-2">
      <span class="text-sm font-semibold text-orange-600 dark:text-orange-400">
        {{ props.trip.priceText || '查看价格' }}
      </span>
      <Button
        as="a"
        size="sm"
        :href="props.trip.jumpUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        预订
      </Button>
    </div>
  </article>
</template>
