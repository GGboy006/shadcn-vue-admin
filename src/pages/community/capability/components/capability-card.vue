<script setup lang="ts">
import type { ICapability } from '@/services/api/capability.api'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

import { capabilityAccessTypeLabel, categoryText } from '../data/status'

defineProps<{
  item: ICapability
}>()

const emit = defineEmits<{
  select: [item: ICapability]
}>()
</script>

<template>
  <Card
    class="cursor-pointer gap-0 py-4 shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    @click="emit('select', item)"
  >
    <CardContent class="flex flex-col gap-3 px-4">
      <div class="flex items-start gap-3">
        <Avatar class="size-12 shrink-0 rounded-md">
          <AvatarImage :src="item.icon || ''" :alt="item.capabilityName" />
          <AvatarFallback class="rounded-md text-sm">
            {{ item.capabilityName.slice(0, 1) }}
          </AvatarFallback>
        </Avatar>
        <div class="min-w-0 flex-1">
          <h3 class="text-base font-semibold line-clamp-1">
            {{ item.capabilityName }}
          </h3>
          <p class="mt-0.5 text-sm text-muted-foreground line-clamp-1">
            {{ categoryText(item.category) }}
            <span v-if="item.provider"> · {{ item.provider }}</span>
          </p>
        </div>
        <Badge
          :variant="item.accessType === 1 ? 'info' : 'secondary'"
          class="shrink-0"
        >
          {{ capabilityAccessTypeLabel[item.accessType] }}
        </Badge>
      </div>

      <p class="min-h-10 text-sm text-muted-foreground line-clamp-2">
        {{ item.description || '暂无描述' }}
      </p>

      <div v-if="item.tags?.length" class="flex flex-wrap gap-1.5">
        <Badge
          v-for="tag in item.tags"
          :key="tag"
          variant="info"
          class="rounded-md font-normal"
        >
          {{ tag }}
        </Badge>
      </div>

      <div v-if="item.samplePrompts?.length" class="space-y-1">
        <p
          v-for="prompt in item.samplePrompts.slice(0, 2)"
          :key="prompt"
          class="text-xs text-muted-foreground"
        >
          「{{ prompt }}」
        </p>
      </div>
    </CardContent>
  </Card>
</template>
