<script lang="ts" setup>
import { computed } from 'vue'

import type { ICommunityServiceGuide } from '@/services/api/community-service-guide.api'

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/prop-ui/modal'
import { Badge } from '@/components/ui/badge'
import { serviceGuideEnableStatusConfig } from '@/services/api/community-service-guide.api'

const props = defineProps<{
  open: boolean
  guide?: ICommunityServiceGuide
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const detail = computed(() => props.guide)

const enableConfig = computed(() => {
  const status = detail.value?.isEnable
  if (status === undefined || status === null)
    return undefined
  return serviceGuideEnableStatusConfig[status]
})
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-2xl">
      <ModalHeader>
        <ModalTitle class="text-base">
          指南详情
        </ModalTitle>
        <ModalDescription class="sr-only">
          查看办事指南的完整内容
        </ModalDescription>
      </ModalHeader>

      <div class="space-y-6">
        <div v-if="detail" class="space-y-6">
          <!-- 封面 + 标题 + 状态 -->
          <div class="flex items-start gap-4">
            <img v-if="detail.poster" :src="detail.poster" alt="封面" class="size-16 rounded border object-cover">
            <div v-else class="flex size-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
              无
            </div>
            <div class="min-w-0 flex-1 space-y-2">
              <h2 class="text-lg font-semibold">
                {{ detail.title }}
              </h2>
              <div class="flex flex-wrap items-center gap-2">
                <Badge v-if="enableConfig" :variant="enableConfig.variant">
                  {{ enableConfig.label }}
                </Badge>
              </div>
            </div>
          </div>

          <!-- 基础信息 -->
          <div class="space-y-2">
            <div class="text-xs font-medium text-muted-foreground">
              基础信息
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span class="text-muted-foreground">单位:</span>
                <span>{{ detail.unit || '-' }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">电话:</span>
                <span>{{ detail.phone || '-' }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">区域名:</span>
                <span>{{ detail.regionName || '-' }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">工作时间:</span>
                <span>{{ detail.worktime || '-' }}</span>
              </div>
              <div class="col-span-2">
                <span class="text-muted-foreground">地址:</span>
                <span>{{ detail.address || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 描述 -->
          <div v-if="detail.describe" class="space-y-1">
            <div class="text-xs font-medium text-muted-foreground">
              描述
            </div>
            <p class="whitespace-pre-wrap text-sm">
              {{ detail.describe }}
            </p>
          </div>

          <!-- 受理条件 -->
          <div v-if="detail.acceptanceConditions" class="space-y-1">
            <div class="text-xs font-medium text-muted-foreground">
              受理条件
            </div>
            <p class="whitespace-pre-wrap text-sm">
              {{ detail.acceptanceConditions }}
            </p>
          </div>

          <!-- 申请材料 -->
          <div v-if="detail.applicationMaterials" class="space-y-1">
            <div class="text-xs font-medium text-muted-foreground">
              申请材料
            </div>
            <p class="whitespace-pre-wrap text-sm">
              {{ detail.applicationMaterials }}
            </p>
          </div>

          <!-- 办理流程 -->
          <div v-if="detail.handlingProcedures" class="space-y-1">
            <div class="text-xs font-medium text-muted-foreground">
              办理流程
            </div>
            <p class="whitespace-pre-wrap text-sm">
              {{ detail.handlingProcedures }}
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
              <span>{{ detail.operatorTime || '-' }}</span>
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
