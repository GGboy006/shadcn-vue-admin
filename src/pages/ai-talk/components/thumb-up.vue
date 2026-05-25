<script lang="ts" setup>
import { ThumbsUpIcon } from '@lucide/vue'
</script>

<template>
  <UiTooltipProvider>
    <UiTooltip>
      <UiTooltipTrigger as-child>
        <UiButton variant="ghost" class="p-1">
          <ThumbsUpIcon class="size-4" />
        </UiButton>
      </UiTooltipTrigger>
      <UiTooltipContent>
        <p>回答很好</p>
      </UiTooltipContent>
    </UiTooltip>
  </UiTooltipProvider>
</template>
