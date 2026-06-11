<script setup lang="ts">
import type { ScrollAreaRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  ScrollAreaCorner,
  ScrollAreaRoot,
  ScrollAreaViewport,
} from "reka-ui"
import { cn } from "@/lib/utils"
import ScrollBar from "./ScrollBar.vue"

const props = defineProps<ScrollAreaRootProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const rootRef = ref<InstanceType<typeof ScrollAreaRoot> | null>(null)

function scrollToBottom(behavior: ScrollBehavior = 'auto') {
  // 使用 ScrollAreaRoot 暴露的 viewport 属性获取可滚动元素
  const viewport = rootRef.value?.viewport
	console.log('viewport',viewport);
	
  if (viewport) {
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior,
    })
  }
}

function scrollToTop(behavior: ScrollBehavior = 'auto') {
  const viewport = rootRef.value?.viewport
  if (viewport) {
    viewport.scrollTo({
      top: 0,
      behavior,
    })
  }
}

defineExpose({
  scrollToBottom,
  scrollToTop,
})
</script>

<template>
  <ScrollAreaRoot
    ref="rootRef"
    data-slot="scroll-area"
    v-bind="delegatedProps"
    :class="cn('relative', props.class)"
  >
    <ScrollAreaViewport
      data-slot="scroll-area-viewport"
      class="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
    >
      <slot />
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
