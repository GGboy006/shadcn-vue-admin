<script lang="ts" setup>
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/prop-ui/modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLazyMount } from '@/composables/use-lazy-mount'
import {
  canAuditResidentVerify,
  residentEnableStatusConfig,
  residentGenderConfig,
  residentIdentityTypeConfig,
  residentMemberStatusConfig,
  residentVerifyStatusConfig,
  useGetResidentDetailQuery,
} from '@/services/api/resident.api'

import { formatDateTime } from '../data/format'
import ResidentVerifyDialog from './resident-verify-dialog.vue'

const props = defineProps<{
  open: boolean
  residentId?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const residentIdRef = computed(() => props.residentId)
const { data, isLoading } = useGetResidentDetailQuery(residentIdRef, isOpen)
const detail = computed(() => data.value?.data)
const isVerifyOpen = ref(false)
const isVerifyOpenRendered = useLazyMount(isVerifyOpen)
const showAudit = computed(() => !!detail.value && canAuditResidentVerify(detail.value))

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

const memberConfig = computed(() => {
  const s = detail.value?.memberStatus
  if (s === undefined || s === null)
    return undefined
  return residentMemberStatusConfig[s]
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

      <div v-if="isLoading" class="space-y-3">
        <Skeleton class="h-16 w-full" />
        <Skeleton class="h-24 w-full" />
      </div>

      <div v-else-if="detail" class="space-y-6">
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
              <Badge v-if="memberConfig" :variant="memberConfig.variant">
                {{ memberConfig.label }}
              </Badge>
              <Badge v-if="enableConfig" :variant="enableConfig.variant">
                {{ enableConfig.label }}
              </Badge>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-medium text-muted-foreground">
            住房信息
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span class="text-muted-foreground">性别:</span>
              <span class="ml-1">{{ genderLabel }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">楼栋号:</span>
              <span class="ml-1">{{ detail.buildingNo || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">单元号:</span>
              <span class="ml-1">{{ detail.unitNo || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">房间号:</span>
              <span class="ml-1">{{ detail.roomNo || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">门牌号:</span>
              <span class="ml-1">{{ detail.doorplate || '-' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">面积:</span>
              <span class="ml-1">{{ detail.houseArea ? `${detail.houseArea}㎡` : '-' }}</span>
            </div>
            <div class="col-span-2">
              <span class="text-muted-foreground">户型:</span>
              <span class="ml-1">{{ detail.houseType || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-medium text-muted-foreground">
            会员与认证
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span class="text-muted-foreground">是否会员:</span>
              <span class="ml-1">{{ detail.isMemberLabel || (detail.isMember === 1 ? '会员' : '非会员') }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">会员到期:</span>
              <span class="ml-1">{{ formatDateTime(detail.memberExpireTime) }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">认证时间:</span>
              <span class="ml-1">{{ formatDateTime(detail.verifyTime) }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">最近活跃:</span>
              <span class="ml-1">{{ formatDateTime(detail.lastActiveTime) }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">AI工具使用次数:</span>
              <span class="ml-1">{{ detail.aiToolCount ?? 0 }}</span>
            </div>
          </div>
        </div>

        <div v-if="detail.remark" class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">
            {{ detail.verifyStatus === 3 ? '驳回原因' : '备注' }}
          </div>
          <p class="whitespace-pre-wrap text-sm">
            {{ detail.remark }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-4 text-sm">
          <div>
            <span class="text-muted-foreground">创建时间:</span>
            <span class="ml-1">{{ formatDateTime(detail.createTime) }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">更新时间:</span>
            <span class="ml-1">{{ formatDateTime(detail.updateTime) }}</span>
          </div>
        </div>
      </div>

      <div v-else class="py-10 text-center text-sm text-muted-foreground">
        居民不存在或无权查看
      </div>

      <ModalFooter v-if="showAudit">
        <Button size="sm" @click="isVerifyOpen = true">
          审核认证
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>

  <ResidentVerifyDialog
    v-if="isVerifyOpenRendered && detail"
    v-model:open="isVerifyOpen"
    :resident="detail"
  />
</template>
