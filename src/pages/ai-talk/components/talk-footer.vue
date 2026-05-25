<script lang="ts" setup>
import { ArrowUpIcon, PaperclipIcon } from '@lucide/vue'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'

import TalkType from './talk-type.vue'

const emit = defineEmits(['submit', 'typeChange'])
const text = ref('')

function handleTypeChange(type: string) {
  emit('typeChange', type)
}

function handleSubmit() {
  emit('submit', text.value)
  nextTick(() => text.value = '')
}
</script>

<template>
  <InputGroup>
    <InputGroupTextarea v-model="text" placeholder="提问、搜索或聊天..." />
    <InputGroupAddon align="block-end">
      <TalkType @update:type="handleTypeChange" />

      <InputGroupButton
        variant="ghost"
        class="rounded-full"
        size="icon-xs"
      >
        <PaperclipIcon class="size-4" />
        <span class="sr-only">添加文件</span>
      </InputGroupButton>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <InputGroupButton variant="ghost">
            自动
          </InputGroupButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          class="[--radius:0.95rem]"
        >
          <DropdownMenuItem>自动</DropdownMenuItem>
          <DropdownMenuItem>代理</DropdownMenuItem>
          <DropdownMenuItem>手动</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InputGroupText class="ml-auto">
        已使用 52%
      </InputGroupText>
      <Separator orientation="vertical" class="h-4!" />

      <InputGroupButton
        variant="default"
        class="rounded-full"
        size="icon-xs"
        :disabled="!text"
        @click="handleSubmit"
      >
        <ArrowUpIcon class="size-4" />
        <span class="sr-only">发送</span>
      </InputGroupButton>
    </InputGroupAddon>
  </InputGroup>
</template>
