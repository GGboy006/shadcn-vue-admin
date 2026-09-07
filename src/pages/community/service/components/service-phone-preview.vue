<script setup lang="ts">
/**
 * 小区服务列表 · 小程序布局仿真预览（挂在列表页，非表单）
 *
 * 布局假设（待小程序侧核对后可微调样式）：
 * - 按 location 分三区：1=顶部 / 2=中部 / 3=底部
 * - 每区 4 列图标宫格（poster + name）
 * - 正式端仅展示 isEnable=1；按 torder 升序
 * - 不仿真跳转（type 仅作角标）
 */
import type {
  CommunityServiceLocation,
  CommunityServiceType,
  ICommunityService,
} from '@/services/api/community-service.api'

import PhoneFrame from '@/components/phone-preview/phone-frame.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { communityServiceLocationConfig, communityServiceTypeConfig } from '@/services/api/community-service.api'

const props = withDefaults(defineProps<{
  /** 用于预览的服务列表（建议已拉全量或大 pageSize） */
  services: ICommunityService[]
  loading?: boolean
}>(), {
  loading: false,
})

const ZONES: { key: CommunityServiceLocation, label: string }[] = [
  { key: 1, label: communityServiceLocationConfig[1].label },
  { key: 2, label: communityServiceLocationConfig[2].label },
  { key: 3, label: communityServiceLocationConfig[3].label },
]

/** 仅启用项，按位置分组并排序 */
const enabledByZone = computed(() => {
  const enabled = props.services
    .filter(s => s.isEnable === 1)
    .slice()
    .sort((a, b) => (a.torder ?? 0) - (b.torder ?? 0))

  const map: Record<CommunityServiceLocation, ICommunityService[]> = {
    1: [],
    2: [],
    3: [],
  }
  for (const s of enabled) {
    const loc = s.location
    if (loc === 1 || loc === 2 || loc === 3)
      map[loc].push(s)
  }
  return map
})

const enabledCount = computed(() =>
  ZONES.reduce((n, z) => n + enabledByZone.value[z.key].length, 0))

function typeLabel(type?: CommunityServiceType) {
  if (type == null || !(type in communityServiceTypeConfig))
    return ''
  return communityServiceTypeConfig[type].label
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between gap-2 px-1">
      <p class="text-xs font-medium text-muted-foreground">
        小程序预览（仿真）
      </p>
      <p class="text-[11px] text-muted-foreground">
        启用 {{ enabledCount }} 项
      </p>
    </div>

    <PhoneFrame title="社区服务">
      <div v-if="loading" class="space-y-3 p-3">
        <Skeleton class="h-28 w-full rounded-xl" />
        <Skeleton class="h-28 w-full rounded-xl" />
        <Skeleton class="h-28 w-full rounded-xl" />
      </div>

      <div v-else class="space-y-3 p-3">
        <section
          v-for="zone in ZONES"
          :key="zone.key"
          class="rounded-xl bg-white p-3 shadow-sm"
        >
          <div class="mb-2 text-xs font-medium text-neutral-700">
            {{ zone.label }}
          </div>

          <div
            v-if="enabledByZone[zone.key].length === 0"
            class="py-4 text-center text-[11px] text-neutral-400"
          >
            暂无启用服务
          </div>

          <div v-else class="grid grid-cols-4 gap-2">
            <div
              v-for="item in enabledByZone[zone.key]"
              :key="item.uniqueCode"
              class="flex flex-col items-center gap-1"
            >
              <div class="relative">
                <div class="flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100">
                  <img
                    v-if="item.poster"
                    :src="item.poster"
                    :alt="item.name"
                    class="size-full object-cover"
                  >
                  <span v-else class="text-[10px] text-neutral-400">
                    图标
                  </span>
                </div>
                <span
                  v-if="typeLabel(item.type)"
                  class="absolute -right-1 -top-1 max-w-[36px] truncate rounded bg-neutral-800/80 px-0.5 text-[8px] leading-3 text-white"
                >
                  {{ typeLabel(item.type) }}
                </span>
              </div>
              <span class="line-clamp-2 w-full text-center text-[11px] leading-tight text-neutral-800">
                {{ item.name || '未命名' }}
              </span>
            </div>
          </div>
        </section>

        <p class="px-1 text-center text-[10px] text-neutral-400">
          仅展示已启用入口；与小程序真实样式可能有偏差
        </p>
      </div>
    </PhoneFrame>
  </div>
</template>
