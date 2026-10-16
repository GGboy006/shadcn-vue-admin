<script setup lang="ts">
import {
  FormSheet,
  FormSheetContent,
  FormSheetDescription,
  FormSheetHeader,
  FormSheetTitle,
} from '@/components/prop-ui/form-sheet'

defineProps<{
  title: string
}>()

const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <FormSheet v-model:open="open">
    <FormSheetContent class="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl">
      <FormSheetHeader class="border-b px-4 py-3">
        <FormSheetTitle class="text-base">
          {{ title }}
        </FormSheetTitle>
        <FormSheetDescription class="sr-only">
          {{ title }}
        </FormSheetDescription>
      </FormSheetHeader>
      <div class="flex-1 overflow-y-auto p-4">
        <slot />
      </div>
    </FormSheetContent>
  </FormSheet>
</template>
