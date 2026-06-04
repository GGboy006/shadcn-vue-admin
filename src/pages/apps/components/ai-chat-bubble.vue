<script setup lang="ts">
import { BotIcon } from '@lucide/vue'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Props {
  content: string
  avatar?: string
  isTyping?: boolean
}

withDefaults(defineProps<Props>(), {
  isTyping: false,
})
</script>

<template>
  <div class="flex items-start gap-3">
    <!-- AI 头像 -->
    <Avatar class="size-10 shrink-0 border-2 border-primary/20">
      <AvatarImage v-if="avatar" :src="avatar" />
      <AvatarFallback class="bg-primary/10">
        <BotIcon class="size-5 text-primary" />
      </AvatarFallback>
    </Avatar>

    <!-- 气泡 -->
    <div class="relative max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-5 py-3.5">
      <p class="text-sm leading-relaxed whitespace-pre-wrap">
        {{ content }}
        <span v-if="isTyping" class="inline-block w-1.5 h-4 ml-0.5 align-middle bg-primary animate-pulse" />
      </p>
    </div>
  </div>
</template>
