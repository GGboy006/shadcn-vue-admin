<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  communityMemberOrderPayStatusConfig,
  communityMemberOrderStatusConfig,
  memberOrderPayPlatformText,
  memberOrderPayStatusText,
  memberOrderPayWayText,
  memberOrderStatusText,
  useGetMemberOrderDetailQuery,
} from '@/services/api/community-member-order.api'

import type { OrderDetailField } from './order-detail-fields.vue'

import { formatDateTime, formatYuan } from '../data/format'
import OrderDetailFields from './order-detail-fields.vue'

const props = defineProps<{
  open: boolean
  uniqueCode?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const uniqueCodeRef = computed(() => props.uniqueCode)
const { data, isLoading } = useGetMemberOrderDetailQuery(uniqueCodeRef, isOpen)
const detail = computed(() => data.value?.data)

function display(value?: string | number | null) {
  if (value == null || value === '')
    return undefined
  return String(value)
}

function optionalDateTime(value?: string | null) {
  if (!value)
    return undefined
  return formatDateTime(value)
}

function field(label: string, value?: string | number | null, span: 1 | 2 = 1): OrderDetailField | null {
  const text = display(value)
  if (text == null)
    return null
  return { label, value: text, span }
}

function pack(items: Array<OrderDetailField | null>): OrderDetailField[] {
  return items.filter((item): item is OrderDetailField => item != null)
}

const payStatusConfig = computed(() => {
  const payStatus = detail.value?.payStatus
  if (payStatus == null)
    return undefined
  return communityMemberOrderPayStatusConfig[payStatus]
})

const statusConfig = computed(() => {
  const status = detail.value?.status
  if (status == null)
    return undefined
  return communityMemberOrderStatusConfig[status]
})

const sections = computed(() => {
  const item = detail.value
  if (!item)
    return []

  const groups: { title: string, items: OrderDetailField[] }[] = []

  const order = pack([
    field('订单标识', item.uniqueCode),
    field('商户订单号', item.orderid),
    field('套餐', item.priceName),
    field('金额', item.price != null ? formatYuan(item.price) : undefined),
    field('有效天数', item.effectiveDays),
    field('套餐标识', item.priceCode, 2),
  ])
  if (order.length)
    groups.push({ title: '订单与套餐', items: order })

  const validity = pack([
    field('会员开始', optionalDateTime(item.startTime)),
    field('会员到期', optionalDateTime(item.endTime)),
  ])
  if (validity.length)
    groups.push({ title: '有效期', items: validity })

  const pay = pack([
    field('支付状态', memberOrderPayStatusText(item.payStatus)),
    field('支付时间', optionalDateTime(item.payTime)),
    field('支付方式', memberOrderPayWayText(item.payWay)),
    field('支付平台', memberOrderPayPlatformText(item.payPlatform)),
    field('第三方交易号', item.tradeCode, 2),
  ])
  if (pay.length)
    groups.push({ title: '支付', items: pay })

  const user = pack([
    field('姓名', item.userName),
    field('手机号', item.phone),
    field('用户标识', item.userUniqueCode, 2),
  ])
  if (user.length)
    groups.push({ title: '居民', items: user })

  const extra = pack([
    field('订单状态', memberOrderStatusText(item.status)),
    field('本站标识', item.businessCode),
    field('小区编号', item.regionCode),
    field('城市合伙人', item.partnerId),
    field('创建时间', optionalDateTime(item.createTime)),
    field('备注', item.remark, 2),
  ])
  if (extra.length)
    groups.push({ title: '其它', items: extra })

  return groups
})
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent
      side="right"
      class="flex w-full flex-col gap-0 p-0 sm:max-w-md"
    >
      <SheetHeader class="border-b px-4 py-3 pr-12">
        <SheetTitle class="text-base">
          {{ detail?.priceName || '会员订单' }}
        </SheetTitle>
        <SheetDescription v-if="detail" class="flex flex-wrap items-center gap-1.5 text-left">
          <Badge v-if="statusConfig" :variant="statusConfig.variant">
            {{ statusConfig.label }}
          </Badge>
          <Badge v-if="payStatusConfig" :variant="payStatusConfig.variant">
            {{ payStatusConfig.label }}
          </Badge>
          <span v-if="detail.orderid" class="tabular-nums">{{ detail.orderid }}</span>
        </SheetDescription>
        <SheetDescription v-else class="sr-only">
          查看本小区会员订单,只读
        </SheetDescription>
      </SheetHeader>

      <div v-if="isLoading" class="space-y-3 p-4">
        <Skeleton class="h-8 w-40" />
        <Skeleton class="h-24 w-full" />
        <Skeleton class="h-24 w-full" />
      </div>

      <div v-else-if="detail" class="flex-1 space-y-3 overflow-y-auto p-4">
        <Card
          v-for="section in sections"
          :key="section.title"
          class="gap-3 py-4 shadow-none"
        >
          <CardHeader class="px-4 pb-0">
            <CardTitle class="text-sm font-medium">
              {{ section.title }}
            </CardTitle>
          </CardHeader>
          <CardContent class="px-4">
            <OrderDetailFields :items="section.items" />
          </CardContent>
        </Card>
      </div>

      <div v-else class="py-16 text-center text-sm text-muted-foreground">
        会员订单不存在
      </div>
    </SheetContent>
  </Sheet>
</template>
