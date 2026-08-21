<script lang="ts" setup>
import type { DonutSlice } from '@/components/workbench/PendingDonutChart.vue'
import type { IMerchantWorkbenchVO } from '@/services/api/workbench.api'

import KpiCard from '@/components/workbench/KpiCard.vue'
import OrderTrendAreaChart from '@/components/workbench/OrderTrendAreaChart.vue'
import PendingDonutChart from '@/components/workbench/PendingDonutChart.vue'
import PendingList from '@/components/workbench/PendingList.vue'

/**
 * 商户/物业后台本身已经是一个独立子系统(侧边栏有商品/订单/活动/FAQ 等完整菜单),
 * 不需要像站长工作台那样再拆多个 Tab,所以这里把原来"概览/经营/商品/待办"
 * 四个 Tab 的核心内容合并成一个单页仪表盘:订单大盘 + 待办 + 商品活动构成 + 其他业务数据。
 */
const props = defineProps<{
  workbench?: IMerchantWorkbenchVO
  loading?: boolean
}>()

const todoItems = computed(() => [
  { label: '待付款订单', count: props.workbench?.pendingPayCount ?? 0, to: '/merchant-business/order' },
  { label: '已退款订单', count: props.workbench?.refundCount ?? 0, to: '/merchant-business/order' },
  { label: '即将到期活动', count: props.workbench?.expiringActivityCount ?? 0, to: '/merchant-business/activity' },
  { label: '下架商品', count: props.workbench?.offSaleCount ?? 0, to: '/merchant-business/goods' },
  { label: '商品分类未配置', count: props.workbench?.categoryReady ? 0 : 1, to: '/merchant-business/category' },
])

const operationSlices = computed<DonutSlice[]>(() => [
  { key: 'onSale', label: '上架商品', value: props.workbench?.onSaleCount ?? 0, color: 'var(--chart-1)' },
  { key: 'offSale', label: '下架商品', value: props.workbench?.offSaleCount ?? 0, color: 'var(--chart-2)' },
  { key: 'activeActivity', label: '进行中活动', value: props.workbench?.activeActivityCount ?? 0, color: 'var(--chart-3)' },
  { key: 'expiringActivity', label: '即将到期活动', value: props.workbench?.expiringActivityCount ?? 0, color: 'var(--chart-4)' },
])
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <KpiCard
      title="今日订单额"
      :value="`¥${(workbench?.todayAmount ?? 0).toLocaleString('zh-CN')}`"
      :description="`今日 ${workbench?.todayOrderCount ?? 0} 笔订单`"
      :loading="loading"
    />
    <KpiCard
      title="近 7 日订单额"
      :value="`¥${(workbench?.last7Amount ?? 0).toLocaleString('zh-CN')}`"
      :description="`近 7 日 ${workbench?.last7OrderCount ?? 0} 笔订单`"
      :loading="loading"
    />
    <KpiCard title="待付款订单" :value="workbench?.pendingPayCount ?? 0" :loading="loading" />
    <KpiCard title="已退款订单" :value="workbench?.refundCount ?? 0" :loading="loading" />
  </div>

  <div class="grid grid-cols-1 gap-4 lg:grid-cols-7">
    <UiCard class="col-span-1 lg:col-span-4">
      <UiCardHeader>
        <UiCardTitle>近 7 日订单趋势</UiCardTitle>
        <UiCardDescription>本周 vs 上周同期订单量</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <OrderTrendAreaChart :items="workbench?.orderTrend ?? []" :loading="loading" />
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
        <UiCardTitle>商品与活动构成</UiCardTitle>
        <UiCardDescription>上架/下架商品与活动状态占比</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <PendingDonutChart :items="operationSlices" :loading="loading" />
      </UiCardContent>
    </UiCard>
    <UiCard class="col-span-1 lg:col-span-3">
      <UiCardHeader>
        <UiCardTitle>其他业务数据</UiCardTitle>
        <UiCardDescription>家政/智采/数字员工/对话/商品配置(近 30 天)</UiCardDescription>
      </UiCardHeader>
      <UiCardContent class="grid grid-cols-2 gap-3">
        <div class="rounded-lg border p-3">
          <p class="text-xs text-muted-foreground">
            家政工单数
          </p>
          <p class="text-xl font-bold">
            {{ workbench?.housekeepingOrderCount ?? 0 }}
          </p>
        </div>
        <div class="rounded-lg border p-3">
          <p class="text-xs text-muted-foreground">
            智采订单数
          </p>
          <p class="text-xl font-bold">
            {{ workbench?.procurementOrderCount ?? 0 }}
          </p>
        </div>
        <div class="rounded-lg border p-3">
          <p class="text-xs text-muted-foreground">
            数字员工数
          </p>
          <p class="text-xl font-bold">
            {{ workbench?.digitalEmployeeCount ?? 0 }}
          </p>
        </div>
        <div class="rounded-lg border p-3">
          <p class="text-xs text-muted-foreground">
            数字员工对话次数
          </p>
          <p class="text-xl font-bold">
            {{ workbench?.conversationCount ?? 0 }}
          </p>
        </div>
        <div class="flex items-center justify-between rounded-lg border p-3">
          <span class="text-xs text-muted-foreground">商品分类</span>
          <UiBadge :variant="workbench?.categoryReady ? 'default' : 'destructive'">
            {{ workbench?.categoryReady ? '已配置' : '未配置' }}
          </UiBadge>
        </div>
        <div class="rounded-lg border p-3">
          <p class="text-xs text-muted-foreground">
            FAQ 总数
          </p>
          <p class="text-xl font-bold">
            {{ workbench?.faqCount ?? 0 }}
          </p>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>
