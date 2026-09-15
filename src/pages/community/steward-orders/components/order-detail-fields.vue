<script setup lang="ts">
export interface OrderDetailField {
  label: string
  value: string
  span?: 1 | 2
}

defineProps<{
  items: OrderDetailField[]
}>()
</script>

<template>
  <dl class="grid grid-cols-2 gap-x-4 gap-y-3">
    <div
      v-for="item in items"
      :key="item.label"
      :class="item.span === 2 ? 'col-span-2' : undefined"
    >
      <dt class="text-xs text-muted-foreground">
        {{ item.label }}
      </dt>
      <dd class="mt-0.5 text-sm break-all">
        {{ item.value }}
      </dd>
    </div>
  </dl>
</template>
