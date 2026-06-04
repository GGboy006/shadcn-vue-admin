<script setup lang="ts">
interface Props {
  current: number
  total: number
  completed: string[]
  stepNames: string[]
}

const props = defineProps<Props>()

const progressPercent = computed(() => {
  if (props.total === 0)
    return 0
  return Math.round((props.completed.length / props.total) * 100)
})
</script>

<template>
  <div class="w-full">
    <!-- 进度条 -->
    <div class="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        class="h-full rounded-full bg-primary transition-all duration-500 ease-out"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>

    <!-- 步骤标签 -->
    <div class="flex justify-between mt-2">
      <span
        v-for="(name, index) in stepNames"
        :key="index"
        class="text-xs transition-colors duration-300"
        :class="{
          'text-primary font-medium': index === current,
          'text-muted-foreground': index !== current,
        }"
      >
        {{ name }}
      </span>
    </div>
  </div>
</template>
