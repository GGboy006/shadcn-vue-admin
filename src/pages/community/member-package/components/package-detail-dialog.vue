<script lang="ts" setup>
import type { ICommunityMemberPrice } from '@/services/api/community-member-price.api'

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/prop-ui/modal'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  communityMemberPriceEnableConfig,
  useGetMemberPriceDetailQuery,
} from '@/services/api/community-member-price.api'

import { formatDateTime, formatYuan } from '../data/format'

const props = defineProps<{
  open: boolean
  price?: ICommunityMemberPrice
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const uniqueCode = computed(() => props.price?.uniqueCode)
const { data, isLoading } = useGetMemberPriceDetailQuery(uniqueCode, isOpen)
const detail = computed(() => data.value?.data)

const enableConfig = computed(() => {
  const status = detail.value?.isEnable
  if (status === undefined || status === null)
    return undefined
  return communityMemberPriceEnableConfig[status]
})
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-2xl">
      <ModalHeader>
        <ModalTitle class="text-base">
          套餐详情
        </ModalTitle>
        <ModalDescription class="sr-only">
          查看本小区会员套餐
        </ModalDescription>
      </ModalHeader>

      <div v-if="isLoading" class="space-y-3">
        <Skeleton class="h-8 w-40" />
        <Skeleton class="h-20 w-full" />
      </div>

      <div v-else-if="detail" class="space-y-6">
        <div class="space-y-2">
          <h2 class="text-lg font-semibold">
            {{ detail.priceName }}
          </h2>
          <div class="flex flex-wrap items-center gap-2">
            <Badge v-if="enableConfig" :variant="enableConfig.variant">
              {{ enableConfig.label }}
            </Badge>
            <span class="text-sm tabular-nums">
              {{ formatYuan(detail.price) }} · {{ detail.effectiveDays }} 天
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <span class="text-muted-foreground">套餐标识:</span>
            <span class="ml-1 break-all tabular-nums">{{ detail.uniqueCode }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">排序:</span>
            <span class="ml-1">{{ detail.sortOrder ?? '-' }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">本站标识:</span>
            <span class="ml-1">{{ detail.businessCode || '-' }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">小区编号:</span>
            <span class="ml-1">{{ detail.regionCode || '-' }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">城市合伙人:</span>
            <span class="ml-1">{{ detail.partnerId || '-' }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">创建时间:</span>
            <span class="ml-1">{{ formatDateTime(detail.createTime) }}</span>
          </div>
        </div>

        <div v-if="detail.remark" class="space-y-1">
          <div class="text-sm font-medium text-muted-foreground">
            备注
          </div>
          <p class="text-sm leading-relaxed">
            {{ detail.remark }}
          </p>
        </div>
      </div>

      <div v-else class="py-10 text-center text-sm text-muted-foreground">
        会员套餐不存在
      </div>
    </ModalContent>
  </Modal>
</template>
