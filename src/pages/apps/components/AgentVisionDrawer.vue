<script setup lang="ts">
import { computed } from 'vue'

import type { AgentVision } from '@/services/api/skill.api'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import AgentVisionContent from './AgentVisionContent.vue'

interface Props {
  open: boolean
  visions: AgentVision[]
  chatId: string
  contentId?: string
  content: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const defaultTab = computed(() => props.visions[0]?.id)

function getVisionLabel(vision: AgentVision) {
  return vision.visionAliasName || vision.name || '预览'
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent
      side="right"
      class="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl"
    >
      <SheetHeader class="border-b px-4 py-3">
        <SheetTitle class="text-base">
          AI 生成内容
        </SheetTitle>
        <SheetDescription class="sr-only">
          查看 AI 生成的 PPT、网页或 Word 内容
        </SheetDescription>
      </SheetHeader>

      <Tabs
        v-if="visions.length > 0"
        :default-value="defaultTab"
        class="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList class="mx-4 mt-3 shrink-0 justify-start">
          <TabsTrigger
            v-for="vision in visions"
            :key="vision.id"
            :value="vision.id"
          >
            {{ getVisionLabel(vision) }}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          v-for="vision in visions"
          :key="vision.id"
          :value="vision.id"
          class="mt-0 flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
        >
          <AgentVisionContent
            :vision="vision"
            :chat-id="chatId"
            :content-id="contentId"
            :content="content"
          />
        </TabsContent>
      </Tabs>

      <div v-else class="flex flex-1 items-center justify-center p-8">
        <p class="text-sm text-muted-foreground">
          暂无可视化内容
        </p>
      </div>
    </SheetContent>
  </Sheet>
</template>
