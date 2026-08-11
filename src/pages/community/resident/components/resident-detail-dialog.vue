<script lang="ts" setup>
import { computed } from 'vue'

import type { IResident } from '@/services/api/resident.api'

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/prop-ui/modal'
import { Badge } from '@/components/ui/badge'
import {
  residentEnableStatusConfig,
  residentGenderConfig,
  residentIdentityTypeConfig,
  residentVerifyStatusConfig,
} from '@/services/api/resident.api'

const props = defineProps<{
  open: boolean
  resident?: IResident
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const detail = computed(() => props.resident)

const identityConfig = computed(() => {
  const t = detail.value?.identityType
  if (t === undefined || t === null)
    return undefined
  return residentIdentityTypeConfig[t]
})

const verifyConfig = computed(() => {
  const s = detail.value?.verifyStatus
  if (s === undefined || s === null)
    return undefined
  return residentVerifyStatusConfig[s]
})

const enableConfig = computed(() => {
  const s = detail.value?.status
  if (s === undefined || s === null)
    return undefined
  return residentEnableStatusConfig[s]
})

const genderLabel = computed(() => {
  const g = detail.value?.gender
  if (g === undefined || g === null)
    return '-'
  return residentGenderConfig[g]?.label ?? '-'
})
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-2xl">
      <ModalHeader>
        <ModalTitle class="text-base">
          居民详情
        </ModalTitle>
        <ModalDescription class="sr-only">
          查看居民的完整信息
        </ModalDescription>
      </ModalHeader>

      <div class="space-y-6">
        <div v-if="detail" class="space-y-6">
          <!-- 头像 + 昵称 + 状态 -->
          <div class="flex items-start gap-4">
            <img v-if="detail.avatar" :src="detail.avatar" alt="头像" class="size-16 rounded-full border object-cover">
            <div v-else class="flex size-16 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
              无
            </div>
            <div class="min-w-0 flex-1 space-y-2">
              <h2 class="text-lg font-semibold">
                {{ detail.nickname || '-' }}
              </h2>
              <div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{{ detail.phone || '-' }}</span>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <Badge v-if="identityConfig" :variant="identityConfig.variant">
                  {{ identityConfig.label }}
                </Badge>
                <Badge v-if="verifyConfig" :variant="verifyConfig.variant">
                  {{ verifyConfig.label }}
                </Badge>
                <Badge v-if="enableConfig" :variant="enableConfig.variant">
                  {{ enableConfig.label }}
                </Badge>
              </div>
            </div>
          </div>

          <!-- 住房信息 -->
          <div class="space-y-2">
            <div class="text-xs font-medium text-muted-foreground">
              住房信息
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span class="text-muted-foreground">性别:</span>
                <span>{{ genderLabel }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">楼栋号:</span>
                <span>{{ detail.buildingNo || '-' }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">单元号:</span>
                <span>{{ detail.unitNo || '-' }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">房间号:</span>
                <span>{{ detail.roomNo || '-' }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">门牌号:</span>
                <span>{{ detail.doorplate || '-' }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">面积:</span>
                <span>{{ detail.houseArea ? `${detail.houseArea}㎡` : '-' }}</span>
              </div>
              <div class="col-span-2">
                <span class="text-muted-foreground">户型:</span>
                <span>{{ detail.houseType || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 使用与认证 -->
          <div class="space-y-2">
            <div class="text-xs font-medium text-muted-foreground">
              使用与认证
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span class="text-muted-foreground">AI工具使用次数:</span>
                <span>{{ detail.aiToolCount ?? 0 }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">最近活跃时间:</span>
                <span>{{ detail.lastActiveTime || '-' }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">认证时间:</span>
                <span>{{ detail.verifyTime || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 备注 -->
          <div v-if="detail.remark" class="space-y-1">
            <div class="text-xs font-medium text-muted-foreground">
              备注
            </div>
            <p class="whitespace-pre-wrap text-sm">
              {{ detail.remark }}
            </p>
          </div>

          <!-- 元信息 -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-4 text-sm">
            <div>
              <span class="text-muted-foreground">创建时间:</span>
              <span>{{ detail.createTime || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">更新时间:</span>
              <span>{{ detail.updateTime || '-' }}</span>
            </div>
          </div>
        </div>

        <div v-else class="py-10 text-center text-sm text-muted-foreground">
          暂无数据
        </div>
      </div>
    </ModalContent>
  </Modal>
</template>
