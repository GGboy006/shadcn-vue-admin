<script lang="ts" setup>
import { computed } from 'vue'

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
  serviceEnableStatusConfig,
  serviceTypeConfig,
  useGetServiceDetailQuery,
} from '@/services/api/neighborhood-service.api'

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

const uniqueCode = computed(() => props.uniqueCode)

const { data, isLoading } = useGetServiceDetailQuery(uniqueCode, isOpen)

const detail = computed(() => data.value?.data)

const typeConfig = computed(() => {
  const type = detail.value?.type
  if (type === undefined || type === null)
    return undefined
  return serviceTypeConfig[type]
})

const enableConfig = computed(() => {
  const status = detail.value?.isEnable
  if (status === undefined || status === null)
    return undefined
  return serviceEnableStatusConfig[status]
})
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-2xl" @open-auto-focus.prevent>
      <ModalHeader>
        <ModalTitle class="text-base">
          居委会服务详情
        </ModalTitle>
        <ModalDescription class="sr-only">
          查看居委会服务的完整内容
        </ModalDescription>
      </ModalHeader>

      <div class="max-h-[70vh] overflow-y-auto">
        <div v-if="isLoading" class="space-y-4">
          <Skeleton class="h-6 w-2/3" />
          <Skeleton class="h-32 w-full" />
        </div>

        <div v-else-if="detail" class="space-y-6">
          <!-- 封面 -->
          <img v-if="detail.poster" :src="detail.poster" alt="封面" class="h-40 w-full rounded-lg border object-cover">

          <!-- 标题与状态 -->
          <div class="space-y-2">
            <h2 class="text-lg font-semibold">
              {{ detail.name }}
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

          <!-- 跳转信息(按类型展示) -->
          <div class="grid grid-cols-1 gap-y-2 gap-x-4 text-sm sm:grid-cols-2">
            <!-- H5 -->
            <div v-if="detail.type === 7 && detail.h5Url" class="sm:col-span-2">
              <span class="text-muted-foreground">H5 地址:</span>
              <a
                :href="detail.h5Url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary underline break-all"
              >
                {{ detail.h5Url }}
              </a>
            </div>
            <!-- 专题 -->
            <div v-if="detail.type === 8 && detail.resCode">
              <span class="text-muted-foreground">专题标识:</span>
              <span>{{ detail.resCode }}</span>
            </div>
            <!-- 小程序 -->
            <template v-if="detail.type === 27">
              <div v-if="detail.appId">
                <span class="text-muted-foreground">微信 APPID:</span>
                <span class="break-all">{{ detail.appId }}</span>
              </div>
              <div v-if="detail.originalAppId">
                <span class="text-muted-foreground">微信原始 appid:</span>
                <span class="break-all">{{ detail.originalAppId }}</span>
              </div>
              <div v-if="detail.bdAppKey">
                <span class="text-muted-foreground">百度小程序 key:</span>
                <span class="break-all">{{ detail.bdAppKey }}</span>
              </div>
            </template>

            <div>
              <span class="text-muted-foreground">排序:</span>
              <span>{{ detail.torder ?? '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">创建时间:</span>
              <span>{{ detail.createTime || '-' }}</span>
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
