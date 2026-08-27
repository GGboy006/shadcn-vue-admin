<script lang="ts" setup>
import { withBase } from '@/utils/with-base'

const previewTab = ref('dashboard')

const posterSrc = withBase('/marketing/mid-autumn-garden-poster.jpg')

const previews = [
  { id: 'dashboard', labelKey: 'marketing.preview.dashboard' },
  { id: 'chat', labelKey: 'marketing.preview.chat' },
  { id: 'merchant', labelKey: 'marketing.preview.merchant' },
] as const

const dashboardKpis = [
  { label: '签约数量合计', value: '28', hint: '商户 / 物业 / 居委会' },
  { label: '签约金额合计', value: '¥186,000', hint: '本小区签约费' },
  { label: '小区公告总数', value: '36', hint: '已发布 29' },
  { label: '意见反馈待处理', value: '8', hint: '今日新增 3' },
]

const dashboardTodos = [
  { label: '小区服务待启用', count: 5 },
  { label: '社区商品待启用', count: 4 },
  { label: '意见反馈待处理', count: 8 },
]

const merchantKpis = [
  { label: '今日订单额', value: '¥3,280', hint: '今日 18 笔' },
  { label: '近 7 日订单额', value: '¥21,640', hint: '126 笔订单' },
  { label: '待付款订单', value: '6', hint: '需跟进' },
  { label: '已退款订单', value: '2', hint: '近 7 日' },
]

const merchantRows = [
  { label: '上架商品', value: '48' },
  { label: '下架商品', value: '5' },
  { label: '进行中活动', value: '3' },
  { label: '即将到期活动', value: '1' },
]
</script>

<template>
  <section class="flex gap-10 justify-between flex-col lg:flex-row pt-10 lg:pt-16">
    <div class="w-full lg:w-5/12">
      <h1 class="text-4xl lg:text-5xl font-black tracking-tight text-balance">
        {{ $t('marketing.hero.title') }}
      </h1>
      <p class="mt-4 text-base lg:text-lg text-muted-foreground leading-relaxed">
        {{ $t('marketing.hero.subtitle') }}
      </p>

      <div class="flex flex-wrap gap-3 mt-10">
        <UiButton size="lg" as-child>
          <router-link to="/auth/sign-in">
            {{ $t('marketing.hero.login') }}
          </router-link>
        </UiButton>
        <UiButton size="lg" variant="outline" as-child>
          <a href="#access">{{ $t('marketing.hero.apply') }}</a>
        </UiButton>
      </div>

      <p class="mt-6 text-sm text-muted-foreground">
        {{ $t('marketing.hero.note') }}
      </p>
    </div>

    <div class="w-full lg:w-7/12">
      <div class="rounded-2xl border bg-card p-3 shadow-sm">
        <div class="flex gap-2 mb-3">
          <button
            v-for="item in previews"
            :key="item.id"
            type="button"
            class="px-3 py-1.5 rounded-md text-sm transition-colors"
            :class="previewTab === item.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'"
            @click="previewTab = item.id"
          >
            {{ $t(item.labelKey) }}
          </button>
        </div>

        <div class="rounded-xl border bg-muted/40 p-4 min-h-72">
          <template v-if="previewTab === 'dashboard'">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium">
                {{ $t('marketing.preview.dashboard') }}
              </p>
              <span class="text-xs text-muted-foreground">示例数据</span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="item in dashboardKpis"
                :key="item.label"
                class="rounded-lg bg-background border p-3"
              >
                <p class="text-xs text-muted-foreground">
                  {{ item.label }}
                </p>
                <p class="text-2xl font-semibold mt-1 tabular-nums">
                  {{ item.value }}
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ item.hint }}
                </p>
              </div>
            </div>
            <div class="mt-3 rounded-lg bg-background border divide-y">
              <div
                v-for="item in dashboardTodos"
                :key="item.label"
                class="flex items-center justify-between px-3 py-2 text-sm"
              >
                <span>{{ item.label }}</span>
                <span class="font-medium tabular-nums">{{ item.count }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="previewTab === 'chat'">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium">
                {{ $t('marketing.preview.chat') }}
              </p>
              <span class="text-xs text-muted-foreground">数字员工 · 生图</span>
            </div>
            <div class="space-y-3">
              <div class="max-w-[88%] rounded-lg bg-background border px-3 py-2 text-sm leading-relaxed">
                帮我做一张中秋游园会海报。今晚 19:00 小区广场，要有月饼和灯笼，竖版就行。
              </div>
              <div class="max-w-[88%] ml-auto space-y-2">
                <div class="rounded-lg bg-primary/10 px-3 py-2 text-sm leading-relaxed">
                  已按「中秋游园会」生成竖版海报，主色暖橙，文案和活动信息都放进去了。
                </div>
                <div class="ml-auto w-36 overflow-hidden rounded-lg border shadow-sm">
                  <img
                    :src="posterSrc"
                    alt="中秋游园会海报"
                    class="w-full aspect-[3/4] object-cover"
                  >
                </div>
              </div>
              <div class="max-w-[88%] rounded-lg bg-background border px-3 py-2 text-sm leading-relaxed">
                标题改成「桂花香里话中秋」，再出一版。
              </div>
              <div class="max-w-[88%] ml-auto rounded-lg bg-primary/10 px-3 py-2 text-sm leading-relaxed">
                好的，正在按新文案重绘，大约 8 秒后可以在工作台查看。
              </div>
            </div>
          </template>

          <template v-else>
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium">
                {{ $t('marketing.preview.merchant') }}
              </p>
              <span class="text-xs text-muted-foreground">桂园早餐铺 · 示例</span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="item in merchantKpis"
                :key="item.label"
                class="rounded-lg bg-background border p-3"
              >
                <p class="text-xs text-muted-foreground">
                  {{ item.label }}
                </p>
                <p class="text-2xl font-semibold mt-1 tabular-nums">
                  {{ item.value }}
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ item.hint }}
                </p>
              </div>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <div
                v-for="item in merchantRows"
                :key="item.label"
                class="flex items-center justify-between rounded-lg bg-background border px-3 py-2 text-sm"
              >
                <span class="text-muted-foreground">{{ item.label }}</span>
                <span class="font-medium tabular-nums">{{ item.value }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
