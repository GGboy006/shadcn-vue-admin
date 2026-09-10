<script lang="ts" setup>
import { computed } from 'vue'

import type { ICommunityService } from '@/services/api/community-service.api'

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/prop-ui/modal'
import { Badge } from '@/components/ui/badge'
import {
  communityServiceEnableStatusConfig,
  communityServiceLocationConfig,
  communityServiceServiceTypeConfig,
  communityServiceTypeConfig,
} from '@/services/api/community-service.api'

const props = defineProps<{
  open: boolean
  service?: ICommunityService
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const detail = computed(() => props.service)

const typeConfig = computed(() => {
  const type = detail.value?.type
  if (type === undefined || type === null)
    return undefined
  return communityServiceTypeConfig[type]
})

const serviceTypeConfig = computed(() => {
  const serviceType = detail.value?.serviceType
  if (serviceType === undefined || serviceType === null)
    return undefined
  return communityServiceServiceTypeConfig[serviceType]
})

const locationConfig = computed(() => {
  const location = detail.value?.location
  if (location === undefined || location === null)
    return undefined
  return communityServiceLocationConfig[location]
})

const enableConfig = computed(() => {
  const status = detail.value?.isEnable
  if (status === undefined || status === null)
    return undefined
  return communityServiceEnableStatusConfig[status]
})
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-2xl">
      <ModalHeader>
        <ModalTitle class="text-base">
          服务详情
        </ModalTitle>
        <ModalDescription class="sr-only">
          查看小区服务的完整内容
        </ModalDescription>
      </ModalHeader>

      <div class="max-h-[70vh] overflow-y-auto">
        <div v-if="detail" class="space-y-6">
          <!-- 封面 -->
          <img v-if="detail.poster" :src="detail.poster" alt="封面" class="h-40 w-full rounded-lg border object-cover">

          <!-- 名称 + 状态 -->
          <div class="space-y-2">
            <h2 class="text-lg font-semibold">
              {{ detail.name }}
            </h2>
            <div class="flex flex-wrap items-center gap-2">
              <Badge v-if="typeConfig" :variant="typeConfig.variant">
                {{ typeConfig.label }}
              </Badge>
              <Badge v-if="locationConfig" variant="secondary">
                {{ locationConfig.label }}
              </Badge>
              <Badge v-if="enableConfig" :variant="enableConfig.variant">
                {{ enableConfig.label }}
              </Badge>
            </div>
          </div>

          <!-- 元信息 -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span class="text-muted-foreground">分类:</span>
              <span>{{ detail.cateName || detail.cateCode || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">服务类型:</span>
              <span>{{ serviceTypeConfig?.label || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">外部标识:</span>
              <span>{{ detail.otherCode || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">小程序 appId:</span>
              <span>{{ detail.appId || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">阅览室编码:</span>
              <span>{{ detail.readingCode || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">H5 地址:</span>
              <a v-if="detail.h5Url" :href="detail.h5Url" target="_blank" rel="noopener noreferrer" class="text-primary underline break-all">
                {{ detail.h5Url }}
              </a>
              <span v-else>-</span>
            </div>
            <div>
              <span class="text-muted-foreground">跳转链接:</span>
              <a v-if="detail.linkUrl" :href="detail.linkUrl" target="_blank" rel="noopener noreferrer" class="text-primary underline break-all">
                {{ detail.linkUrl }}
              </a>
              <span v-else>-</span>
            </div>
            <div>
              <span class="text-muted-foreground">地址:</span>
              <span>{{ detail.address || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">营业时间:</span>
              <span>{{ detail.businessHours || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">排序:</span>
              <span>{{ detail.torder ?? '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">创建时间:</span>
              <span>{{ detail.createTime || '-' }}</span>
            </div>
          </div>

          <!-- 描述 -->
          <div v-if="detail.describe" class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">
              描述
            </div>
            <p class="text-sm leading-relaxed">
              {{ detail.describe }}
            </p>
          </div>
        </div>

        <div v-else class="py-10 text-center text-sm text-muted-foreground">
          暂无数据
        </div>
      </div>
    </ModalContent>
  </Modal>
</template>
