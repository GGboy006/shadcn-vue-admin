<script setup lang="ts">
import { HistoryIcon, ReceiptIcon, StarIcon } from '@lucide/vue'

import type { IHousekeeperOrderEvaluation, IHousekeeperOrderPayment, IHousekeeperOrderStatusLog } from '@/services/api/housekeeper-order.api'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item'
import { Rating } from '@/components/ui/rating'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/ui/timeline'
import { useGetHousekeeperOrderDetailQuery } from '@/services/api/housekeeper-order.api'

import type { OrderDetailField } from './order-detail-fields.vue'

import { formatDateTime, formatYuan } from '../data/format'
import {
  housekeeperAssignModeLabel,
  housekeeperCancelByLabel,
  housekeeperEvaluatorTypeLabel,
  housekeeperOperatorTypeLabel,
  housekeeperOrderPayStatusStyle,
  housekeeperOrderStatusStyle,
  housekeeperPayChannelLabel,
  housekeeperPaymentPayStatusLabel,
  housekeeperPaymentPayStatusStyle,
  housekeeperPaymentSceneLabel,
  orderStatusText,
} from '../data/status'
import OrderDetailFields from './order-detail-fields.vue'

const props = defineProps<{
  open: boolean
  orderId?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const orderIdRef = computed(() => props.orderId)
const { data, isLoading } = useGetHousekeeperOrderDetailQuery(orderIdRef, isOpen)
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

function localLabel(code?: string) {
  if (!code || code === 'LOCAL')
    return '本站'
  return code
}

function paymentStatusText(payment: IHousekeeperOrderPayment) {
  if (payment.payStatusLabel)
    return payment.payStatusLabel
  if (payment.payStatus == null)
    return '-'
  return housekeeperPaymentPayStatusLabel[payment.payStatus] ?? String(payment.payStatus)
}

function nameInitial(name?: string | null) {
  const text = name?.trim()
  return text ? text.slice(0, 1) : '?'
}

function logIndicatorClass(log: IHousekeeperOrderStatusLog) {
  if (log.toStatus === 5 || log.toStatus === 6)
    return '!border-destructive !bg-destructive'
  if (log.toStatus === 4)
    return '!border-emerald-500 !bg-emerald-500'
  return undefined
}

const serviceSections = computed(() => {
  const item = detail.value
  if (!item)
    return []

  const sections: { title: string, items: OrderDetailField[] }[] = []

  const service = pack([
    field('订单号', item.orderNo),
    field('服务', item.itemName),
    field('分类', item.categoryName),
    field('单价', item.unitPrice != null ? formatYuan(item.unitPrice) : undefined),
    field('数量', item.quantity != null ? `${item.quantity}${item.unit ? ` ${item.unit}` : ''}` : undefined),
    field('订单金额', item.totalAmount != null ? formatYuan(item.totalAmount) : undefined),
    field('实付金额', item.payAmount != null ? formatYuan(item.payAmount) : undefined),
    field('成交金额', item.actualAmount != null ? formatYuan(item.actualAmount) : undefined),
    field('下单备注', item.remark, 2),
  ])
  if (service.length)
    sections.push({ title: '服务与金额', items: service })

  const fulfill = pack([
    field('服务馆', item.housekeeperName),
    field('师傅', item.staffName || '待抢单'),
    field('师傅电话', item.servicePersonPhone),
    field('分配方式', item.assignMode ? housekeeperAssignModeLabel[item.assignMode] : undefined),
    field('履约方', localLabel(item.fulfillProviderCode)),
  ])
  if (fulfill.length)
    sections.push({ title: '履约', items: fulfill })

  const contact = pack([
    field('居民', item.residentNickname),
    field('居民手机', item.residentPhone),
    field('上门联系人', item.contactName),
    field('联系手机', item.contactPhone),
    field('服务地址', item.serviceAddress, 2),
  ])
  if (contact.length)
    sections.push({ title: '居民与上门', items: contact })

  const times = pack([
    field('预约时间', optionalDateTime(item.appointmentTime)),
    field('接单时间', optionalDateTime(item.acceptTime)),
    field('开始服务', optionalDateTime(item.serviceStartTime)),
    field('完成时间', optionalDateTime(item.serviceEndTime)),
    field('确认完成', optionalDateTime(item.confirmTime)),
  ])
  if (times.length)
    sections.push({ title: '履约节点', items: times })

  const cancel = pack([
    field('取消时间', optionalDateTime(item.cancelTime)),
    field('取消方', item.cancelBy ? housekeeperCancelByLabel[item.cancelBy] : undefined),
    field('取消原因', item.cancelReason, 2),
  ])
  if (cancel.length)
    sections.push({ title: '取消信息', items: cancel })

  return sections
})

function evaluationName(evaluation: IHousekeeperOrderEvaluation) {
  if (evaluation.isAnonymous === 1)
    return '匿名'
  return evaluation.evaluatorName || '-'
}

function dimensionScores(evaluation: IHousekeeperOrderEvaluation) {
  return pack([
    field('态度', evaluation.serviceAttitudeScore),
    field('质量', evaluation.serviceQualityScore),
    field('速度', evaluation.serviceSpeedScore),
  ])
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent
      side="right"
      class="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl"
    >
      <SheetHeader class="border-b px-4 py-3 pr-12">
        <SheetTitle class="text-base">
          {{ detail?.orderNo || '订单详情' }}
        </SheetTitle>
        <SheetDescription v-if="detail" class="flex flex-col gap-2 text-left">
          <span>{{ [detail.itemName, detail.housekeeperName].filter(Boolean).join(' · ') || '查看服务信息、支付流水、评价与状态日志' }}</span>
          <span class="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              :class="housekeeperOrderStatusStyle[detail.orderStatus]"
            >
              {{ detail.orderStatusLabel || orderStatusText(detail.orderStatus) }}
            </Badge>
            <Badge
              v-if="detail.payStatus != null"
              variant="outline"
              :class="housekeeperOrderPayStatusStyle[detail.payStatus]"
            >
              {{ detail.payStatusLabel || '-' }}
            </Badge>
          </span>
        </SheetDescription>
        <SheetDescription v-else class="sr-only">
          查看服务信息、支付流水、评价与状态日志
        </SheetDescription>
      </SheetHeader>

      <div v-if="isLoading" class="space-y-3 p-4">
        <Skeleton class="h-8 w-48" />
        <Skeleton class="h-28 w-full" />
        <Skeleton class="h-28 w-full" />
      </div>

      <template v-else-if="detail">
        <Tabs default-value="service" class="flex min-h-0 flex-1 flex-col overflow-hidden">
          <TabsList class="mx-4 mt-3 shrink-0 justify-start">
            <TabsTrigger value="service">
              服务信息
            </TabsTrigger>
            <TabsTrigger value="pay">
              支付
            </TabsTrigger>
            <TabsTrigger value="logs">
              评价与日志
            </TabsTrigger>
          </TabsList>

          <TabsContent value="service" class="mt-0 flex-1 space-y-3 overflow-y-auto p-4">
            <Card
              v-for="section in serviceSections"
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

            <Card v-if="detail.serviceDesc" class="gap-3 py-4 shadow-none">
              <CardHeader class="px-4 pb-0">
                <CardTitle class="text-sm font-medium">
                  需求描述
                </CardTitle>
              </CardHeader>
              <CardContent class="px-4">
                <p class="whitespace-pre-wrap text-sm">
                  {{ detail.serviceDesc }}
                </p>
              </CardContent>
            </Card>

            <Card v-if="detail.serviceImages?.length" class="gap-3 py-4 shadow-none">
              <CardHeader class="px-4 pb-0">
                <CardTitle class="text-sm font-medium">
                  需求图片
                </CardTitle>
              </CardHeader>
              <CardContent class="px-4">
                <div class="grid grid-cols-4 gap-2">
                  <a
                    v-for="url in detail.serviceImages"
                    :key="url"
                    :href="url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="overflow-hidden rounded-md border"
                  >
                    <img
                      :src="url"
                      alt="需求图片"
                      class="aspect-square size-full object-cover"
                    >
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pay" class="mt-0 flex-1 overflow-y-auto p-4">
            <Empty
              v-if="!detail.payments?.length"
              class="border-dashed py-10 md:p-8"
            >
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ReceiptIcon />
                </EmptyMedia>
                <EmptyTitle>暂无支付流水</EmptyTitle>
                <EmptyDescription>
                  该订单还没有支付或退款记录
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
            <div v-else class="space-y-3">
              <Card
                v-for="payment in detail.payments"
                :key="payment.paymentId"
                class="gap-3 py-4 shadow-none"
              >
                <CardHeader class="px-4 [.border-b]:pb-3">
                  <CardTitle class="font-medium tabular-nums">
                    {{ payment.paymentNo || payment.paymentId }}
                  </CardTitle>
                  <CardDescription>
                    {{ payment.paymentScene ? housekeeperPaymentSceneLabel[payment.paymentScene] : '支付流水' }}
                    <span v-if="payment.channel"> · {{ housekeeperPayChannelLabel[payment.channel] }}</span>
                  </CardDescription>
                  <CardAction>
                    <Badge
                      variant="outline"
                      :class="payment.payStatus != null ? housekeeperPaymentPayStatusStyle[payment.payStatus] : undefined"
                    >
                      {{ paymentStatusText(payment) }}
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardContent class="px-4">
                  <div class="mb-4 text-2xl font-semibold tabular-nums tracking-tight">
                    {{ formatYuan(payment.amount) }}
                  </div>
                  <OrderDetailFields
                    :items="pack([
                      field('渠道单号', payment.thirdTradeNo),
                      field('支付时间', optionalDateTime(payment.payTime)),
                      field('关闭时间', optionalDateTime(payment.closeTime)),
                      field('退款金额', payment.refundAmount != null && payment.refundAmount > 0 ? formatYuan(payment.refundAmount) : undefined),
                      field('退款时间', optionalDateTime(payment.refundTime)),
                    ])"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" class="mt-0 flex-1 space-y-6 overflow-y-auto p-4">
            <section>
              <h3 class="mb-3 text-sm font-medium">
                评价
              </h3>
              <Empty
                v-if="!detail.evaluations?.length"
                class="border-dashed py-8 md:p-8"
              >
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <StarIcon />
                  </EmptyMedia>
                  <EmptyTitle>暂无评价</EmptyTitle>
                  <EmptyDescription>
                    订单完成后才会出现评价
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
              <div v-else class="space-y-3">
                <Card
                  v-for="evaluation in detail.evaluations"
                  :key="evaluation.evaluationId"
                  class="gap-3 py-4 shadow-none"
                >
                  <CardHeader class="px-4">
                    <div class="flex items-start gap-3">
                      <Avatar class="size-9">
                        <AvatarFallback class="text-xs">
                          {{ nameInitial(evaluationName(evaluation)) }}
                        </AvatarFallback>
                      </Avatar>
                      <div class="min-w-0 flex-1">
                        <CardTitle class="text-sm font-medium">
                          {{ evaluationName(evaluation) }}
                        </CardTitle>
                        <CardDescription class="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge v-if="evaluation.evaluatorType" variant="secondary">
                            {{ housekeeperEvaluatorTypeLabel[evaluation.evaluatorType] }}
                          </Badge>
                          <span class="tabular-nums">{{ formatDateTime(evaluation.createTime) }}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent class="space-y-3 px-4">
                    <Rating
                      v-if="evaluation.score != null"
                      :rating="evaluation.score"
                      size="sm"
                      show-value
                    />
                    <ItemGroup v-if="dimensionScores(evaluation).length" class="gap-1.5">
                      <Item
                        v-for="score in dimensionScores(evaluation)"
                        :key="score.label"
                        variant="muted"
                        size="sm"
                        class="px-3 py-2"
                      >
                        <ItemContent>
                          <ItemTitle class="text-xs text-muted-foreground">
                            {{ score.label }}
                          </ItemTitle>
                        </ItemContent>
                        <ItemActions>
                          <Rating :rating="Number(score.value)" size="sm" />
                        </ItemActions>
                      </Item>
                    </ItemGroup>
                    <p v-if="evaluation.content" class="whitespace-pre-wrap text-sm">
                      {{ evaluation.content }}
                    </p>
                    <div v-if="evaluation.images?.length" class="grid grid-cols-4 gap-2">
                      <a
                        v-for="url in evaluation.images"
                        :key="url"
                        :href="url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="overflow-hidden rounded-md border"
                      >
                        <img
                          :src="url"
                          alt="评价图片"
                          class="aspect-square size-full object-cover"
                        >
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator />

            <section>
              <h3 class="mb-3 text-sm font-medium">
                状态日志
              </h3>
              <Empty
                v-if="!detail.statusLogs?.length"
                class="border-dashed py-8 md:p-8"
              >
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HistoryIcon />
                  </EmptyMedia>
                  <EmptyTitle>暂无日志</EmptyTitle>
                  <EmptyDescription>
                    还没有状态变更记录
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
              <Timeline
                v-else
                :default-value="detail.statusLogs.length"
              >
                <TimelineItem
                  v-for="(log, index) in detail.statusLogs"
                  :key="log.logId"
                  :step="index + 1"
                >
                  <TimelineSeparator />
                  <TimelineIndicator :class="logIndicatorClass(log)" />
                  <TimelineHeader>
                    <TimelineDate>{{ formatDateTime(log.createTime) }}</TimelineDate>
                    <TimelineTitle class="flex flex-wrap items-center gap-1.5">
                      <span>{{ log.fromStatus == null ? '新建' : orderStatusText(log.fromStatus) }}</span>
                      <span class="text-muted-foreground font-normal">→</span>
                      <Badge
                        variant="outline"
                        class="font-normal"
                        :class="log.toStatus != null ? housekeeperOrderStatusStyle[log.toStatus] : undefined"
                      >
                        {{ orderStatusText(log.toStatus) }}
                      </Badge>
                    </TimelineTitle>
                  </TimelineHeader>
                  <TimelineContent class="flex flex-wrap items-center gap-1.5">
                    <span>{{ log.operatorName || '-' }}</span>
                    <Badge v-if="log.operatorType" variant="outline">
                      {{ housekeeperOperatorTypeLabel[log.operatorType] }}
                    </Badge>
                  </TimelineContent>
                  <TimelineContent v-if="log.remark">
                    {{ log.remark }}
                  </TimelineContent>
                </TimelineItem>
              </Timeline>
            </section>
          </TabsContent>
        </Tabs>
      </template>

      <div v-else class="py-16 text-center text-sm text-muted-foreground">
        未找到订单
      </div>
    </SheetContent>
  </Sheet>
</template>
