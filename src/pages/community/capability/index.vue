<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { LibraryIcon } from '@lucide/vue'

import type { CapabilityAccessType, ICapability, ICapabilityListQuery } from '@/services/api/capability.api'

import { BasicPage } from '@/components/global-layout'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { useGetCapabilityListQuery } from '@/services/api/capability.api'

import CapabilityCard from './components/capability-card.vue'
import CapabilityDetailSheet from './components/capability-detail-sheet.vue'
import { capabilityAccessTypeOptions, capabilityCategoryFilterOptions } from './data/status'

const query = ref<ICapabilityListQuery>({})
const { data, isLoading, isError, error } = useGetCapabilityListQuery(query)
const list = computed(() => data.value?.data ?? [])

const accessTypeFilter = ref('all')
const categoryFilter = ref('all')

watch(accessTypeFilter, (val) => {
  query.value = {
    ...query.value,
    accessType: val === 'all' ? undefined : Number(val) as CapabilityAccessType,
  }
})

watch(categoryFilter, (val) => {
  query.value = {
    ...query.value,
    category: val === 'all' ? undefined : val,
  }
})

const selectedId = ref<string>()
const isDetailOpen = ref(false)
const isDetailRendered = useLazyMount(isDetailOpen)

function handleSelect(item: ICapability) {
  selectedId.value = item.capabilityId
  isDetailOpen.value = true
}
</script>

<template>
  <BasicPage
    title="居民AI服务"
    description="本站已接入的能力，只读展示"
    sticky
  >
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <Select v-model="accessTypeFilter">
        <SelectTrigger class="h-8 w-36">
          <SelectValue placeholder="接入方式" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            全部类型
          </SelectItem>
          <SelectItem
            v-for="item in capabilityAccessTypeOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="categoryFilter">
        <SelectTrigger class="h-8 w-[10.5rem]">
          <SelectValue placeholder="业务分类" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            全部分类
          </SelectItem>
          <SelectItem
            v-for="item in capabilityCategoryFilterOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Skeleton v-for="index in 8" :key="index" class="h-44 w-full" />
    </div>

    <Empty
      v-else-if="isError"
      class="border-dashed"
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LibraryIcon />
        </EmptyMedia>
        <EmptyTitle>加载失败</EmptyTitle>
        <EmptyDescription>
          {{ error?.message || '请稍后重试' }}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>

    <Empty
      v-else-if="!list.length"
      class="border-dashed"
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LibraryIcon />
        </EmptyMedia>
        <EmptyTitle>暂无启用能力</EmptyTitle>
        <EmptyDescription>
          本站还没有启用的能力
        </EmptyDescription>
      </EmptyHeader>
    </Empty>

    <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <CapabilityCard
        v-for="item in list"
        :key="item.capabilityId"
        :item="item"
        @select="handleSelect"
      />
    </div>

    <CapabilityDetailSheet
      v-if="isDetailRendered"
      v-model:open="isDetailOpen"
      :capability-id="selectedId"
    />
  </BasicPage>
</template>
