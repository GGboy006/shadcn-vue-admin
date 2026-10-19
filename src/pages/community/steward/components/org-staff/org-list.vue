<script setup lang="ts">
import { PlusIcon, SearchIcon } from '@lucide/vue'

import type { IHousekeeperService } from '@/services/api/housekeeper.api'

import Badge from '@/components/ui/badge/Badge.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { housekeeperIntegrationLabel, housekeeperOrgKind, housekeeperPayModeLabel, isThirdPartyHousekeeper } from '@/services/api/housekeeper-account'
import { housekeeperEnableStatusConfig } from '@/services/api/housekeeper.api'

const props = defineProps<{
  loading?: boolean
  orgs: IHousekeeperService[]
  selectedId?: string
  search: string
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'select': [housekeeperId: string]
  'create': []
}>()

const searchModel = computed({
  get: () => props.search,
  set: v => emit('update:search', v),
})

function kindOf(org: IHousekeeperService) {
  return housekeeperOrgKind(org)
}

function kindLabel(org: IHousekeeperService) {
  return housekeeperIntegrationLabel(org.integrationMode) || '第三方'
}
</script>

<template>
  <div class="flex h-[calc(100dvh-10rem)] min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border bg-card lg:sticky lg:top-4">
    <div class="space-y-2 border-b p-3">
      <div class="text-sm font-medium">
        服务机构
      </div>
      <div class="relative">
        <SearchIcon class="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
        <Input
          v-model="searchModel"
          placeholder="搜索机构..."
          class="h-9 pl-8"
        />
      </div>
      <Button variant="outline" class="w-full" @click="emit('create')">
        <PlusIcon class="size-4" />
        新建机构
      </Button>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto p-2">
      <div v-if="loading" class="space-y-2 p-1">
        <Skeleton v-for="i in 4" :key="i" class="h-14 w-full" />
      </div>

      <div v-else-if="orgs.length === 0" class="px-2 py-8 text-center text-sm text-muted-foreground">
        暂无服务机构，请先新建
      </div>

      <button
        v-for="org in orgs"
        :key="org.housekeeperId"
        type="button"
        class="mb-1 flex w-full items-start gap-2 rounded-md border px-3 py-2.5 text-left transition-colors hover:bg-accent"
        :class="cn(selectedId === org.housekeeperId && 'border-primary bg-accent')"
        @click="emit('select', org.housekeeperId)"
      >
        <div class="min-w-0 flex-1">
          <div class="flex min-w-0 items-center gap-1.5">
            <span class="truncate text-sm font-medium">{{ org.name }}</span>
            <Badge
              v-if="kindOf(org) !== 'local'"
              :variant="kindOf(org) === 'partner' ? 'gold' : 'info'"
              class="h-5 shrink-0 px-1.5 text-[10px]"
            >
              {{ kindLabel(org) }}
            </Badge>
          </div>
          <div class="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span v-if="!isThirdPartyHousekeeper(org)">{{ org.staffCount ?? 0 }} 人</span>
            <Badge
              v-if="org.status && housekeeperEnableStatusConfig[org.status]"
              :variant="housekeeperEnableStatusConfig[org.status].variant"
              class="h-5 px-1.5 text-[10px]"
            >
              {{ housekeeperEnableStatusConfig[org.status].label }}
            </Badge>
            <Badge
              v-if="housekeeperPayModeLabel(org.payMode)"
              :variant="org.payMode === 1 ? 'info' : 'gold'"
              class="h-5 px-1.5 text-[10px]"
            >
              {{ housekeeperPayModeLabel(org.payMode) }}
            </Badge>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
