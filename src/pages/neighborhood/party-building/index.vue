<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetPartySummaryQuery } from '@/services/api/neighborhood-governance.api'

import OpenContentPanel from '../components/open-content-panel.vue'
import ActivityCreate from './components/activity-create.vue'
import ActivityPanel from './components/activity-panel.vue'
import FeeCreate from './components/fee-create.vue'
import FeePanel from './components/fee-panel.vue'
import MeetingCreate from './components/meeting-create.vue'
import MeetingPanel from './components/meeting-panel.vue'
import PublicityCreate from './components/publicity-create.vue'
import PublicityPanel from './components/publicity-panel.vue'

const tab = ref('publicity')
const { data, isLoading } = useGetPartySummaryQuery()
const summary = computed(() => data.value?.data)

const cards = computed(() => [
  { label: '党员人数', value: summary.value?.partyMemberCount ?? '—' },
  { label: '班子人数', value: summary.value?.committeeCount ?? '—' },
  { label: '公示中', value: summary.value?.publishingCount ?? '—' },
  { label: '本月已召开', value: summary.value?.monthMeetingCount ?? '—' },
  { label: '党费缴纳比例', value: summary.value ? `${summary.value.feeRate}%` : '—' },
])
</script>

<template>
  <BasicPage title="党建管理" description="公示、三会一课、党费、近期活动和党务公开" sticky>
    <template #actions>
      <PublicityCreate v-if="tab === 'publicity'" />
      <MeetingCreate v-else-if="tab === 'meeting'" />
      <FeeCreate v-else-if="tab === 'fee'" />
      <ActivityCreate v-else-if="tab === 'activity'" />
    </template>
    <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <template v-if="isLoading">
        <Skeleton v-for="item in 5" :key="item" class="h-20" />
      </template>
      <template v-else>
        <div v-for="item in cards" :key="item.label" class="rounded-lg border bg-card px-4 py-3">
          <div class="text-sm text-muted-foreground">
            {{ item.label }}
          </div>
          <div class="mt-1 text-2xl font-semibold tabular-nums">
            {{ item.value }}
          </div>
        </div>
      </template>
    </div>

    <Tabs v-model="tab">
      <TabsList class="flex h-auto flex-wrap">
        <TabsTrigger value="publicity">
          发展党员公示
        </TabsTrigger>
        <TabsTrigger value="meeting">
          三会一课
        </TabsTrigger>
        <TabsTrigger value="fee">
          党费缴纳
        </TabsTrigger>
        <TabsTrigger value="activity">
          近期活动
        </TabsTrigger>
        <TabsTrigger value="party-open">
          党务公开
        </TabsTrigger>
        <TabsTrigger value="promise">
          履职承诺
        </TabsTrigger>
      </TabsList>
      <TabsContent value="publicity" class="mt-4">
        <PublicityPanel />
      </TabsContent>
      <TabsContent value="meeting" class="mt-4">
        <MeetingPanel />
      </TabsContent>
      <TabsContent value="fee" class="mt-4">
        <FeePanel />
      </TabsContent>
      <TabsContent value="activity" class="mt-4">
        <ActivityPanel />
      </TabsContent>
      <TabsContent value="party-open" class="mt-4">
        <OpenContentPanel :type="2" label="党务公开" />
      </TabsContent>
      <TabsContent value="promise" class="mt-4">
        <OpenContentPanel :type="3" label="履职承诺" />
      </TabsContent>
    </Tabs>
  </BasicPage>
</template>
