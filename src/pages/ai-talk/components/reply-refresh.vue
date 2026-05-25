<script lang="ts" setup>
import { RefreshCcwIcon } from '@lucide/vue'
</script>

<template>
  <UiTooltipProvider>
    <UiTooltip>
      <UiTooltipTrigger as-child>
        <UiButton variant="ghost" class="p-1">
          <RefreshCcwIcon class="size-4" />
        </UiButton>
      </UiTooltipTrigger>
      <UiTooltipContent>
        <p>重新生成</p>
      </UiTooltipContent>
    </UiTooltip>
  </UiTooltipProvider>
</template>
