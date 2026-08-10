<script lang="ts" setup>
import { computed } from 'vue'

import type { ICommunityPhone } from '@/services/api/community-phone.api'

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/prop-ui/modal'
import { Badge } from '@/components/ui/badge'
import {
  communityPhoneEnableStatusConfig,
  communityPhoneTypeConfig,
} from '@/services/api/community-phone.api'

const props = defineProps<{
  open: boolean
  phone?: ICommunityPhone
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const detail = computed(() => props.phone)

const typeConfig = computed(() => {
  const type = detail.value?.type
  if (type === undefined || type === null)
    return undefined
  return communityPhoneTypeConfig[type]
})

const enableConfig = computed(() => {
  const status = detail.value?.isEnable
  if (status === undefined || status === null)
    return undefined
  return communityPhoneEnableStatusConfig[status]
})
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-2xl">
      <ModalHeader>
        <ModalTitle class="text-base">
          电话详情
        </ModalTitle>
        <ModalDescription class="sr-only">
          查看社区电话的完整内容
        </ModalDescription>
      </ModalHeader>

      <div class="space-y-6">
        <div v-if="detail" class="space-y-6">
          <!-- 图片 + 标题 + 状态 -->
          <div class="flex items-start gap-4">
            <img v-if="detail.poster" :src="detail.poster" alt="图片" class="size-16 rounded border object-cover">
            <div v-else class="flex size-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
              无
            </div>
            <div class="min-w-0 flex-1 space-y-2">
              <h2 class="text-lg font-semibold">
                {{ detail.title }}
              </h2>
              <div class="flex flex-wrap items-center gap-2">
                <Badge v-if="typeConfig" :variant="typeConfig.variant">
                  {{ typeConfig.label }}
                </Badge>
                <Badge v-if="enableConfig" :variant="enableConfig.variant">
                  {{ enableConfig.label }}
                </Badge>
              </div>
            </div>
          </div>

          <!-- 值班信息 -->
          <div class="space-y-2">
            <div class="text-xs font-medium text-muted-foreground">
              值班信息
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span class="text-muted-foreground">区域名:</span>
                <span>{{ detail.regionName || '-' }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">值班电话:</span>
                <span>{{ detail.regionPhone || '-' }}</span>
              </div>
              <div class="col-span-2">
                <span class="text-muted-foreground">工作时间:</span>
                <span>{{ detail.workTime || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 联系信息 -->
          <div class="space-y-2">
            <div class="text-xs font-medium text-muted-foreground">
              联系信息
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span class="text-muted-foreground">联系人:</span>
                <span>{{ detail.contactUser || '-' }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">联系电话:</span>
                <span>{{ detail.contactPhone || '-' }}</span>
              </div>
              <div class="col-span-2">
                <span class="text-muted-foreground">客服微信:</span>
                <span>{{ detail.customerServiceWeixin || '-' }}</span>
              </div>
            </div>
            <div v-if="detail.wechatQrcode" class="flex items-center gap-3 pt-1">
              <img :src="detail.wechatQrcode" alt="微信二维码" class="size-20 rounded border object-cover">
              <span class="text-xs text-muted-foreground">微信二维码</span>
            </div>
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
