<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { useOrgWorkbenchQuery } from '@/services/api/workbench.api'

import WorkbenchOverview from './components/workbench-overview.vue'

// City Data 约定每端最多调用 1 次汇总接口。居委会后台本身已经是独立子系统
// (侧边栏有完整的公告/活动/资讯/留言等菜单),这里不再用 Tab 拆分,单页展示核心数据即可。
const { data, isLoading } = useOrgWorkbenchQuery()
const workbench = computed(() => data.value?.data)
</script>

<template>
  <BasicPage
    title="首页"
    description="居委会工作台概览"
    sticky
  >
    <div class="space-y-4">
      <WorkbenchOverview :workbench="workbench" :loading="isLoading" />
    </div>
  </BasicPage>
</template>
