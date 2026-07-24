<script setup lang="ts">
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useGetOrderDetailQuery } from '@/services/api/merchant-business.api'

import { orderStatusConfig } from '../data/status'

const props = defineProps<{
  orderid: string
}>()

const { merchantId } = useCurrentMerchantId()
const orderidRef = computed(() => props.orderid)
const { data, isLoading } = useGetOrderDetailQuery(merchantId, orderidRef)

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
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <span class="text-lg font-medium tabular-nums">
            {{ detail.orderid }}
          </span>
          <span v-if="orderStatusConfig[detail.statusType]" class="text-xs px-2 py-0.5 rounded border" :class="orderStatusConfig[detail.statusType].style">
            {{ orderStatusConfig[detail.statusType].label }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div class="text-muted-foreground">
              客户姓名
            </div>
            <div>{{ detail.customerName || '-' }}</div>
          </div>
          <div>
            <div class="text-muted-foreground">
              订单金额
            </div>
            <div class="tabular-nums">
              {{ detail.price != null ? `¥${detail.price}` : '-' }}
            </div>
          </div>
          <div>
            <div class="text-muted-foreground">
              支付方式
            </div>
            <div>{{ detail.payWayLabel || '-' }}</div>
          </div>
          <div>
            <div class="text-muted-foreground">
              下单时间
            </div>
            <div class="tabular-nums">
              {{ formatTime(detail.createTime) }}
            </div>
          </div>
          <div>
            <div class="text-muted-foreground">
              支付时间
            </div>
            <div class="tabular-nums">
              {{ formatTime(detail.payTime) }}
            </div>
          </div>
        </div>

        <div class="text-sm">
          <div class="text-muted-foreground mb-1">
            商品明细
          </div>
          <div class="whitespace-pre-wrap">
            {{ detail.goodsDesc || '-' }}
          </div>
        </div>
      </div>
    </template>
    <div v-else class="py-10 text-center text-muted-foreground">
      未找到订单
    </div>
  </div>
</template>
