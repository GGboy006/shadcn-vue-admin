<script setup lang="ts">
import { RichTextContent } from '@/components/prop-ui/rich-text'
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useGetGoodsDetailQuery } from '@/services/api/merchant-business.api'

import { goodsChargeConfig, goodsRecommendConfig, goodsStatusConfig } from '../data/data'

const props = defineProps<{
  goodsCode: string
}>()

const { merchantId } = useCurrentMerchantId()
const goodsCodeRef = computed(() => props.goodsCode)
const { data, isLoading } = useGetGoodsDetailQuery(merchantId, goodsCodeRef)

const detail = computed(() => data.value?.data)
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
          <div class="text-sm text-muted-foreground">
            分类:{{ detail.cateName || '-' }}
          </div>
          <div class="text-sm tabular-nums">
            价格:{{ detail.salePrice != null ? `¥${detail.salePrice}` : '-' }}
          </div>
          <div class="flex gap-2 pt-1">
            <span v-if="goodsChargeConfig[detail.freeFlag ?? 0]" class="text-xs px-2 py-0.5 rounded border" :class="goodsChargeConfig[detail.freeFlag ?? 0].style">
              {{ goodsChargeConfig[detail.freeFlag ?? 0].label }}
            </span>
            <span v-if="goodsRecommendConfig[detail.isRecommend]" class="text-xs px-2 py-0.5 rounded border" :class="goodsRecommendConfig[detail.isRecommend].style">
              {{ goodsRecommendConfig[detail.isRecommend].label }}
            </span>
            <span v-if="goodsStatusConfig[detail.isEnable]" class="text-xs px-2 py-0.5 rounded border" :class="goodsStatusConfig[detail.isEnable].style">
              {{ goodsStatusConfig[detail.isEnable].label }}
            </span>
          </div>
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
        <RichTextContent :content="detail.content" />
      </div>
    </template>
    <div v-else class="py-10 text-center text-muted-foreground">
      未找到商品
    </div>
  </div>
</template>
