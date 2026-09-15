<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { StarIcon } from "@lucide/vue"
import { cva, type VariantProps } from "class-variance-authority"
import { computed } from "vue"
import { cn } from "@/lib/utils"

const ratingVariants = cva("flex items-center", {
  variants: {
    size: {
      sm: "gap-1",
      default: "gap-1.5",
      lg: "gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const starVariants = cva("shrink-0", {
  variants: {
    size: {
      sm: "size-3.5",
      default: "size-4",
      lg: "size-5",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const valueVariants = cva("text-muted-foreground tabular-nums", {
  variants: {
    size: {
      sm: "text-xs",
      default: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const props = withDefaults(defineProps<{
  rating: number
  maxRating?: number
  size?: VariantProps<typeof ratingVariants>["size"]
  showValue?: boolean
  class?: HTMLAttributes["class"]
}>(), {
  maxRating: 5,
  size: "default",
  showValue: false,
})

const fills = computed(() => {
  return Array.from({ length: props.maxRating }, (_, index) => {
    const star = index + 1
    if (props.rating >= star)
      return 100
    if (props.rating > star - 1)
      return Math.round((props.rating - (star - 1)) * 100)
    return 0
  })
})
</script>

<template>
  <div
    data-slot="rating"
    role="img"
    :aria-label="`${props.rating} / ${props.maxRating}`"
    :class="cn(ratingVariants({ size: props.size }), props.class)"
  >
    <span
      v-for="(fill, index) in fills"
      :key="index"
      class="relative inline-flex"
      aria-hidden="true"
    >
      <StarIcon :class="cn(starVariants({ size: props.size }), 'text-muted-foreground/30')" />
      <span
        class="absolute inset-0 overflow-hidden"
        :style="{ width: `${fill}%` }"
      >
        <StarIcon :class="cn(starVariants({ size: props.size }), 'fill-amber-400 text-amber-400')" />
      </span>
    </span>
    <span
      v-if="showValue"
      data-slot="rating-value"
      :class="valueVariants({ size: props.size })"
    >
      {{ Number(props.rating).toFixed(1) }}
    </span>
  </div>
</template>
