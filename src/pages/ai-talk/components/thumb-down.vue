<script lang="ts" setup>
import { ThumbsDownIcon } from '@lucide/vue'
</script>

<template>
  <UiTooltipProvider>
    <UiTooltip>
      <UiTooltipTrigger as-child>
        <UiButton variant="ghost" class="p-1">
          <ThumbsDownIcon class="size-4" />
        </UiButton>
      </UiTooltipTrigger>
      <UiTooltipContent>
        <p>回答不好</p>
      </UiTooltipContent>
    </UiTooltip>
  </UiTooltipProvider>
</template>
