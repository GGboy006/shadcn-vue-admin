<script setup lang="ts">
/**
 * 管理端手机框壳：固定约 375 宽，供小程序布局仿真预览复用。
 * 不仿真真机安全区细节；偏差可接受。
 */
withDefaults(defineProps<{
  /** 状态栏下方标题（可选） */
  title?: string
}>(), {
  title: '',
})
</script>

<template>
  <div
    class="mx-auto w-[320px] shrink-0 overflow-hidden rounded-[28px] border border-border bg-background shadow-lg sm:w-[375px]"
  >
    <!-- 状态栏占位 -->
    <div class="flex h-11 items-end justify-between bg-background px-6 pb-1.5 text-[11px] font-medium text-foreground">
      <span>9:41</span>
      <div class="flex items-center gap-1">
        <span class="inline-block h-2.5 w-4 rounded-sm border border-foreground/70" />
        <span class="inline-block h-2 w-1 rounded-sm bg-foreground/70" />
      </div>
    </div>

    <!-- 导航标题栏 -->
    <div
      v-if="title"
      class="flex h-11 items-center justify-center border-b border-border/60 px-4 text-sm font-semibold"
    >
      <span class="truncate">{{ title }}</span>
    </div>

    <!-- 内容区 -->
    <div class="max-h-[560px] min-h-[420px] overflow-y-auto bg-[#f5f5f5]">
      <slot />
    </div>

    <!-- Home Indicator -->
    <div class="flex h-5 items-center justify-center bg-[#f5f5f5]">
      <div class="h-1 w-28 rounded-full bg-foreground/20" />
    </div>
  </div>
</template>
