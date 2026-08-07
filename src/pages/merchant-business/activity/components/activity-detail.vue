<script setup lang="ts">
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useGetActivityDetailQuery } from '@/services/api/merchant-business.api'

import {
  activityChargeConfig,
  activityRecommendConfig,
  activityStatusConfig,
} from '../data/data'

const props = defineProps<{
  activityCode: string
}>()

const { merchantId } = useCurrentMerchantId()
const activityCodeRef = computed(() => props.activityCode)
const { data, isLoading } = useGetActivityDetailQuery(merchantId, activityCodeRef)

const detail = computed(() => data.value?.data)

function formatTime(iso: string): string {
  if (!iso)
    return '-'
  return iso.replace('T', ' ').slice(0, 16)
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="isLoading" class="py-10 text-center text-muted-foreground">
      加载中...
    </div>
    <template v-else-if="detail">
      <div class="flex items-start gap-4">
        <img v-if="detail.poster" :src="detail.poster" alt="封面" class="h-24 w-24 rounded object-cover border">
        <div v-else class="h-24 w-24 rounded bg-muted flex items-center justify-center text-sm text-muted-foreground">
          无封面
        </div>
        <div class="flex-1 space-y-1">
          <div class="text-lg font-medium">
            {{ detail.name }}
          </div>
          <div v-if="detail.sponsorName" class="text-sm text-muted-foreground">
            主办:{{ detail.sponsorName }}
          </div>
          <div class="text-sm tabular-nums">
            时间:{{ formatTime(detail.startTime) }} ~ {{ formatTime(detail.endTime) }}
          </div>
          <div v-if="detail.address" class="text-sm text-muted-foreground">
            地址:{{ detail.address }}
          </div>
          <div class="flex flex-wrap gap-2 pt-1">
            <span v-if="activityChargeConfig[detail.isCharge]" class="text-xs px-2 py-0.5 rounded border" :class="activityChargeConfig[detail.isCharge].style">
              {{ activityChargeConfig[detail.isCharge].label }}
            </span>
            <span v-if="detail.isCharge === 1 && detail.salePrice != null" class="text-xs px-2 py-0.5 rounded border bg-gray-100/30 text-gray-700 dark:text-gray-300 border-gray-200">
              ¥{{ detail.salePrice }}
            </span>
            <span v-if="activityRecommendConfig[detail.isRecommend]" class="text-xs px-2 py-0.5 rounded border" :class="activityRecommendConfig[detail.isRecommend].style">
              {{ activityRecommendConfig[detail.isRecommend].label }}
            </span>
            <span v-if="activityStatusConfig[detail.isEnable]" class="text-xs px-2 py-0.5 rounded border" :class="activityStatusConfig[detail.isEnable].style">
              {{ activityStatusConfig[detail.isEnable].label }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="detail.auditRemark" class="text-sm rounded border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-3">
        <div class="text-amber-900 dark:text-amber-100 mb-1 font-medium">
          审核评论
        </div>
        <div class="text-amber-800 dark:text-amber-200">
          {{ detail.auditRemark }}
        </div>
      </div>

      <div v-if="detail.describes" class="text-sm">
        <div class="text-muted-foreground mb-1">
          简介
        </div>
        {{ detail.describes }}
      </div>

      <div v-if="detail.detailPoster" class="text-sm">
        <div class="text-muted-foreground mb-1">
          详情图
        </div>
        <img :src="detail.detailPoster" alt="详情图" class="max-h-60 rounded border">
      </div>

      <div v-if="detail.content" class="text-sm">
        <div class="text-muted-foreground mb-1">
          内容
        </div>
        <div class="whitespace-pre-wrap">
          {{ detail.content }}
        </div>
      </div>
    </template>
    <div v-else class="py-10 text-center text-muted-foreground">
      未找到活动
    </div>
  </div>
</template>
