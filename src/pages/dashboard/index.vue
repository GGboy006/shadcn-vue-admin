<script lang="ts" setup>
import { BasicPage } from '@/components/global-layout'
import { useStationWorkbenchQuery } from '@/services/api/workbench.api'

import WorkbenchCommittee from './components/workbench-committee.vue'
import WorkbenchCommunity from './components/workbench-community.vue'
import WorkbenchMerchant from './components/workbench-merchant.vue'
import WorkbenchOverview from './components/workbench-overview.vue'

/**
 * Tab 划分对齐站长真实的三大管理对象:商户/小区服务/居委会(见侧边栏
 * `stationNavData` 的分组),而不是笼统的"经营"/"待办"——避免同一份数据在
 * 多个 Tab 里重复展示,也让每个 Tab 的数据来源都能对应到具体业务模块。
 */
const tabs = [
  { name: '概览', value: 'overview' },
  { name: '商户', value: 'merchant' },
  { name: '小区服务', value: 'community' },
  { name: '居委会', value: 'committee' },
]

const activeTab = ref(tabs[0].value)

// City Data 约定每端最多调用 1 次汇总接口,这里在页面级请求一次,
// 各 Tab 内容组件只做展示,不重复发请求。
const { data, isLoading } = useStationWorkbenchQuery()
const workbench = computed(() => data.value?.data)
</script>

<template>
  <BasicPage
    title="工作台"
    description="站长工作台概览"
    sticky
  >
    <UiTabs :default-value="activeTab" class="w-full">
      <UiTabsList>
        <UiTabsTrigger
          v-for="tab in tabs" :key="tab.value"
          :value="tab.value"
        >
          {{ tab.name }}
        </UiTabsTrigger>
      </UiTabsList>
      <UiTabsContent value="overview" class="space-y-4">
        <WorkbenchOverview :workbench="workbench" :loading="isLoading" />
      </UiTabsContent>
      <UiTabsContent value="merchant" class="space-y-4">
        <WorkbenchMerchant :workbench="workbench" :loading="isLoading" />
      </UiTabsContent>
      <UiTabsContent value="community" class="space-y-4">
        <WorkbenchCommunity :workbench="workbench" :loading="isLoading" />
      </UiTabsContent>
      <UiTabsContent value="committee" class="space-y-4">
        <WorkbenchCommittee :workbench="workbench" :loading="isLoading" />
      </UiTabsContent>
    </UiTabs>
  </BasicPage>
</template>
