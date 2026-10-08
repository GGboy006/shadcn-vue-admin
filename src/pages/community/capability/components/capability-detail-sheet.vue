<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Item, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetCapabilityDetailQuery } from '@/services/api/capability.api'

import { accessTypeBadgeVariant, capabilityAccessTypeLabel, categoryText } from '../data/status'

const props = defineProps<{
  open: boolean
  capabilityId?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const capabilityIdRef = computed(() => props.capabilityId)
const { data, isLoading } = useGetCapabilityDetailQuery(capabilityIdRef, isOpen)
const detail = computed(() => data.value?.data)
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent
      side="right"
      class="flex w-full flex-col gap-0 p-0 sm:max-w-md"
    >
      <SheetHeader class="border-b px-4 py-3 pr-12">
        <SheetTitle class="text-base">
          {{ detail?.capabilityName || '能力详情' }}
        </SheetTitle>
        <SheetDescription v-if="detail" class="flex flex-wrap items-center gap-1.5 text-left">
          <Badge :variant="accessTypeBadgeVariant(detail.accessType)">
            {{ capabilityAccessTypeLabel[detail.accessType] }}
          </Badge>
          <span>{{ categoryText(detail.category) }}</span>
          <span v-if="detail.provider">· {{ detail.provider }}</span>
        </SheetDescription>
        <SheetDescription v-else class="sr-only">
          查看已接入能力的描述、标签与示例问法
        </SheetDescription>
      </SheetHeader>

      <div v-if="isLoading" class="space-y-3 p-4">
        <Skeleton class="h-8 w-40" />
        <Skeleton class="h-20 w-full" />
        <Skeleton class="h-16 w-full" />
      </div>

      <div v-else-if="detail" class="flex-1 space-y-3 overflow-y-auto p-4">
        <Card class="gap-3 py-4 shadow-none">
          <CardHeader class="px-4">
            <CardTitle class="text-sm font-medium">
              {{ detail.capabilityName }}
            </CardTitle>
            <p class="text-xs text-muted-foreground tabular-nums">
              {{ detail.capabilityCode }}
            </p>
          </CardHeader>
          <CardContent class="px-4">
            <p class="whitespace-pre-wrap text-sm text-muted-foreground">
              {{ detail.description || '暂无描述' }}
            </p>
          </CardContent>
        </Card>

        <Card v-if="detail.tags?.length" class="gap-3 py-4 shadow-none">
          <CardHeader class="px-4">
            <CardTitle class="text-sm font-medium">
              标签
            </CardTitle>
          </CardHeader>
          <CardContent class="px-4">
            <div class="flex flex-wrap gap-1.5">
              <Badge
                v-for="tag in detail.tags"
                :key="tag"
                variant="info"
                class="rounded-md font-normal"
              >
                {{ tag }}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card v-if="detail.samplePrompts?.length" class="gap-3 py-4 shadow-none">
          <CardHeader class="px-4">
            <CardTitle class="text-sm font-medium">
              示例问法
            </CardTitle>
          </CardHeader>
          <CardContent class="px-4">
            <ItemGroup class="gap-2">
              <Item
                v-for="prompt in detail.samplePrompts"
                :key="prompt"
                variant="muted"
                size="sm"
              >
                <ItemContent>
                  <ItemTitle class="font-normal">
                    {{ prompt }}
                  </ItemTitle>
                </ItemContent>
              </Item>
            </ItemGroup>
          </CardContent>
        </Card>
      </div>

      <div v-else class="py-16 text-center text-sm text-muted-foreground">
        未找到该能力
      </div>
    </SheetContent>
  </Sheet>
</template>
