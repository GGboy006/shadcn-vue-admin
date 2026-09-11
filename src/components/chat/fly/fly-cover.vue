<script setup lang="ts">
import { ImageOffIcon } from '@lucide/vue'
import { ref } from 'vue'

const props = defineProps<{
  src?: string
  alt?: string
}>()

const failed = ref(false)

function onError() {
  failed.value = true
}
</script>

<template>
  <div class="relative aspect-[16/10] w-full overflow-hidden bg-muted">
    <img
      v-if="props.src && !failed"
      :src="props.src"
      :alt="props.alt || ''"
      class="h-full w-full object-cover"
      @error="onError"
    >
    <div
      v-else
      class="flex h-full w-full items-center justify-center text-muted-foreground"
    >
      <ImageOffIcon class="size-8" />
    </div>
  </div>
</template>
