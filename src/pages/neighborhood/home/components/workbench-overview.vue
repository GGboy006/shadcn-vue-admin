<script lang="ts" setup>
import type { DonutSlice } from '@/components/workbench/PendingDonutChart.vue'
import type { IOrgWorkbenchVO } from '@/services/api/workbench.api'

import KpiCard from '@/components/workbench/KpiCard.vue'
import PendingDonutChart from '@/components/workbench/PendingDonutChart.vue'
import PendingList from '@/components/workbench/PendingList.vue'

/**
 * 居委会后台本身已经是一个独立子系统(侧边栏有公告/活动/资讯/留言等完整菜单),
 * 不需要像站长工作台那样再拆多个 Tab,所以这里把原来"概览/活动/社区/待办"
 * 四个 Tab 的核心内容合并成一个单页仪表盘:活动构成 + 待办 + 内容待处理构成 + 其他数据。
 */
const props = defineProps<{
  workbench?: IOrgWorkbenchVO
  loading?: boolean
}>()

const todoItems = computed(() => [
  { label: '公告待发布', count: props.workbench?.noticePendingCount ?? 0, to: '/neighborhood/notice' },
  { label: '活动待审', count: props.workbench?.activityPendingCount ?? 0, to: '/neighborhood/activity' },
  { label: '资讯动态待审', count: props.workbench?.dynamicPendingCount ?? 0, to: '/neighborhood/dynamic' },
  { label: '专题待发布', count: props.workbench?.specialPendingCount ?? 0, to: '/neighborhood/special' },
  { label: '广告待发布', count: props.workbench?.bannerPendingCount ?? 0, to: '/neighborhood/banner' },
  { label: '留言待处理', count: props.workbench?.leaveMessagePending ?? 0, to: '/neighborhood/leave-message' },
  { label: '意见反馈待处理', count: props.workbench?.feedbackPendingCount ?? 0 },
])

const activitySlices = computed<DonutSlice[]>(() => [
  { key: 'ongoing', label: '进行中', value: props.workbench?.ongoingActivityCount ?? 0, color: 'var(--chart-1)' },
  { key: 'upcoming', label: '即将开始', value: props.workbench?.upcomingActivityCount ?? 0, color: 'var(--chart-2)' },
  { key: 'expiring', label: '即将结束', value: props.workbench?.expiringActivityCount ?? 0, color: 'var(--chart-3)' },
  { key: 'recommend', label: '推荐活动', value: props.workbench?.recommendActivityCount ?? 0, color: 'var(--chart-4)' },
])

const contentPendingSlices = computed<DonutSlice[]>(() => [
  { key: 'notice', label: '公告待发布', value: props.workbench?.noticePendingCount ?? 0, color: 'var(--chart-1)' },
  { key: 'dynamic', label: '资讯动态待审', value: props.workbench?.dynamicPendingCount ?? 0, color: 'var(--chart-2)' },
  { key: 'special', label: '专题待发布', value: props.workbench?.specialPendingCount ?? 0, color: 'var(--chart-3)' },
  { key: 'banner', label: '广告待发布', value: props.workbench?.bannerPendingCount ?? 0, color: 'var(--chart-4)' },
])
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <KpiCard title="公告已发布" :value="workbench?.noticePublishedCount ?? 0" :loading="loading" />
    <KpiCard title="资讯动态待审" :value="workbench?.dynamicPendingCount ?? 0" :loading="loading" />
    <KpiCard title="留言待处理" :value="workbench?.leaveMessagePending ?? 0" :loading="loading" />
    <KpiCard title="服务热线条数" :value="workbench?.hotlineCount ?? 0" :loading="loading" />
  </div>

  <div class="grid grid-cols-1 gap-4 lg:grid-cols-7">
    <UiCard class="col-span-1 lg:col-span-4">
      <UiCardHeader>
        <UiCardTitle>活动构成</UiCardTitle>
        <UiCardDescription>进行中/即将开始/即将结束/推荐活动数占比</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <PendingDonutChart :items="activitySlices" :loading="loading" />
      </UiCardContent>
    </UiCard>
    <UiCard class="col-span-1 lg:col-span-3">
      <UiCardHeader>
        <UiCardTitle>待办事项</UiCardTitle>
        <UiCardDescription>点击可跳转到对应管理页面</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <PendingList :items="todoItems" :loading="loading" empty-text="暂无待办事项" />
      </UiCardContent>
    </UiCard>
  </div>

  <div class="grid grid-cols-1 gap-4 lg:grid-cols-7">
    <UiCard class="col-span-1 lg:col-span-4">
      <UiCardHeader>
        <UiCardTitle>内容待处理构成</UiCardTitle>
        <UiCardDescription>公告/资讯/专题/广告的待发布与待审占比</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <PendingDonutChart :items="contentPendingSlices" :loading="loading" />
      </UiCardContent>
    </UiCard>
    <UiCard class="col-span-1 lg:col-span-3">
      <UiCardHeader>
        <UiCardTitle>其他数据</UiCardTitle>
        <UiCardDescription>反馈/知识/AI/活动发布(近 30 天)</UiCardDescription>
      </UiCardHeader>
      <UiCardContent class="grid grid-cols-2 gap-3">
        <div class="rounded-lg border p-3">
          <p class="text-xs text-muted-foreground">
            意见反馈待处理
          </p>
          <p class="text-xl font-bold">
            {{ workbench?.feedbackPendingCount ?? 0 }}
          </p>
        </div>
        <div class="rounded-lg border p-3">
          <p class="text-xs text-muted-foreground">
            知识服务阅读量
          </p>
          <p class="text-xl font-bold">
            {{ workbench?.knowledgeReadCount ?? 0 }}
          </p>
        </div>
        <div class="rounded-lg border p-3">
          <p class="text-xs text-muted-foreground">
            AI 对话次数
          </p>
          <p class="text-xl font-bold">
            {{ workbench?.aiConversationCount ?? 0 }}
          </p>
        </div>
        <div class="rounded-lg border p-3">
          <p class="text-xs text-muted-foreground">
            居委会服务条目数
          </p>
          <p class="text-xl font-bold">
            {{ workbench?.serviceCount ?? 0 }}
          </p>
        </div>
        <div class="rounded-lg border p-3">
          <p class="text-xs text-muted-foreground">
            活动待审
          </p>
          <p class="text-xl font-bold">
            {{ workbench?.activityPendingCount ?? 0 }}
          </p>
        </div>
        <div class="rounded-lg border p-3">
          <p class="text-xs text-muted-foreground">
            活动已发布
          </p>
          <p class="text-xl font-bold">
            {{ workbench?.activityPublishedCount ?? 0 }}
          </p>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>
