<script setup lang="ts">
import { BanIcon, ChevronLeftIcon, CircleCheckIcon, PencilIcon, PlusIcon, Trash2Icon } from '@lucide/vue'
import { useDebounceFn, useMediaQuery } from '@vueuse/core'
import { toast } from 'vue-sonner'

import type { IHousekeeperStaffListQuery } from '@/services/api/housekeeper.api'

import { Copy } from '@/components/prop-ui/copy'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { canStationManageStaff, housekeeperAccountLabel } from '@/services/api/housekeeper-account'
import {
  useGetHousekeeperServiceDetailQuery,
  useGetHousekeeperStaffPageQuery,
  useUpdateHousekeeperServiceStatusMutation,
} from '@/services/api/housekeeper.api'

import ServiceDeleteContent from '../service/service-delete.vue'
import ServiceEdit from '../service/service-edit.vue'
import StaffDataTable from '../staff/data-table.vue'
import StaffEdit from '../staff/staff-edit.vue'
import { staffPanelColumns } from './staff-panel-columns'
import StaffPanelToolbar from './staff-panel-toolbar.vue'

const props = withDefaults(defineProps<{
  orgId?: string
  showBack?: boolean
  /** station=站长管全站；self=管家只看本馆人员 */
  manageMode?: 'station' | 'self'
}>(), {
  manageMode: 'station',
})

const emit = defineEmits<{
  back: []
}>()

const orgIdRef = computed(() => props.orgId)

const { data: detailData, isLoading: isDetailLoading } = useGetHousekeeperServiceDetailQuery(orgIdRef)
const org = computed(() => detailData.value?.data)
const isSelf = computed(() => props.manageMode === 'self')
const staffWritable = computed(() => isSelf.value || canStationManageStaff(org.value))
const staffLockHint = computed(() => {
  if (staffWritable.value || !org.value)
    return ''
  return '第三方网点不能添加师傅'
})

const staffQuery = ref<IHousekeeperStaffListQuery>({
  pageNum: 1,
  pageSize: 10,
  housekeeperId: undefined,
})

const staffSearch = ref('')
const staffStatusFilter = ref<IHousekeeperStaffListQuery['status']>(undefined)

const debouncedStaffSearch = useDebounceFn((val: string) => {
  staffQuery.value.staffName = val || undefined
  staffQuery.value.pageNum = 1
}, 300)

watch(staffSearch, val => debouncedStaffSearch(val))

watch(staffStatusFilter, (val) => {
  staffQuery.value.status = val
  staffQuery.value.pageNum = 1
})

watch(orgIdRef, (id) => {
  staffQuery.value.housekeeperId = id
  staffQuery.value.pageNum = 1
  staffSearch.value = ''
  staffStatusFilter.value = undefined
  staffQuery.value.staffName = undefined
  staffQuery.value.status = undefined
}, { immediate: true })

const { data: staffData, isLoading: isStaffLoading } = useGetHousekeeperStaffPageQuery(staffQuery)

const staffColumns = computed(() => {
  if (staffWritable.value)
    return staffPanelColumns
  return staffPanelColumns.filter(column => column.id !== 'actions')
})

const staffList = computed(() => staffData.value?.data?.list ?? [])
const staffTotal = computed(() => staffData.value?.data?.total ?? 0)

const staffServerPagination = computed(() => ({
  page: staffQuery.value.pageNum,
  pageSize: staffQuery.value.pageSize,
  total: staffTotal.value,
  onPageChange: (page: number) => {
    staffQuery.value.pageNum = page
  },
  onPageSizeChange: (pageSize: number) => {
    staffQuery.value.pageSize = pageSize
    staffQuery.value.pageNum = 1
  },
}))

function handleStaffReset() {
  staffSearch.value = ''
  staffStatusFilter.value = undefined
  staffQuery.value.staffName = undefined
  staffQuery.value.status = undefined
  staffQuery.value.pageNum = 1
}

const isEditOpen = ref(false)
const isEditOpenRendered = useLazyMount(isEditOpen)
const isDeleteOpen = ref(false)
const isDeleteOpenRendered = useLazyMount(isDeleteOpen)
const isStaffCreateOpen = ref(false)
const isStaffCreateOpenRendered = useLazyMount(isStaffCreateOpen)

const { mutate: toggleStatus, isPending: isToggling } = useUpdateHousekeeperServiceStatusMutation()

function handleToggleStatus() {
  if (!org.value)
    return
  const next = org.value.status === 1 ? 2 : 1
  toggleStatus({ housekeeperId: org.value.housekeeperId, status: next }, {
    onSuccess: () => toast.success(next === 1 ? '已启用' : '已禁用'),
    onError: (err: any) => toast.error(err.message || '操作失败'),
  })
}

const isDesktop = useMediaQuery('(min-width: 1024px)')
</script>

<template>
  <div class="flex h-full min-h-[480px] flex-col rounded-lg border bg-card">
    <template v-if="!orgId">
      <div class="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
        <div class="space-y-2">
          <p>请从左侧选择或新建服务机构</p>
          <p v-if="!isDesktop" class="text-xs">
            在手机上先点选机构，再管理该机构下的人员
          </p>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="border-b px-4 py-3">
        <div v-if="showBack" class="mb-1.5">
          <Button variant="ghost" size="sm" class="-ml-2 h-7" @click="emit('back')">
            <ChevronLeftIcon class="size-4" />
            返回机构列表
          </Button>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div v-if="isDetailLoading" class="space-y-1.5">
              <Skeleton class="h-5 w-36" />
              <Skeleton class="h-3.5 w-48" />
            </div>
            <template v-else-if="org">
              <div class="flex min-w-0 items-center gap-2">
                <h3 class="truncate text-base font-semibold">
                  {{ org.name }}
                </h3>
                <span v-if="!isSelf" class="inline-flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
                  {{ housekeeperAccountLabel(org) }}
                  <template v-if="org.loginPhone">
                    · {{ org.loginPhone }}
                    <Copy
                      :content="org.loginPhone"
                      variant="ghost"
                      class="size-6"
                      copy-tooltip-text="复制账号"
                      copied-tooltip-text="已复制"
                    />
                  </template>
                </span>
                <span class="shrink-0 text-xs text-muted-foreground">
                  <template v-if="org.contactName || org.contactPhone">
                    <span v-if="org.contactName">{{ org.contactName }}</span>
                    <span v-if="org.contactPhone" class="ml-1">{{ org.contactPhone }}</span>
                  </template>
                  <template v-else>
                    暂无联系信息
                  </template>
                </span>
              </div>
              <p v-if="org.description" class="mt-0.5 truncate text-xs text-muted-foreground" :title="org.description">
                {{ org.description }}
              </p>
            </template>
          </div>

          <div v-if="org && !isSelf" class="flex shrink-0 items-center gap-1.5">
            <Button size="sm" variant="outline" class="h-8" :disabled="isToggling" @click="handleToggleStatus">
              <BanIcon v-if="org.status === 1" class="size-3.5" />
              <CircleCheckIcon v-else class="size-3.5" />
              {{ org.status === 1 ? '禁用' : '启用' }}
            </Button>
            <Button size="sm" variant="outline" class="h-8" @click="isEditOpen = true">
              <PencilIcon class="size-3.5" />
              编辑
            </Button>
            <Button
              size="sm"
              variant="outline"
              class="h-8 text-destructive hover:text-destructive"
              :disabled="(org.staffCount ?? 0) > 0"
              :title="(org.staffCount ?? 0) > 0 ? `该机构下有 ${org.staffCount} 名人员，需先移除后再删除` : undefined"
              @click="isDeleteOpen = true"
            >
              <Trash2Icon class="size-3.5" />
              删除
            </Button>
          </div>
        </div>
      </div>

      <div class="flex min-h-0 flex-1 flex-col p-4">
        <div class="mb-3 flex items-center justify-between">
          <div class="text-sm font-medium">
            本机构人员
          </div>
          <Button v-if="staffWritable" size="sm" @click="isStaffCreateOpen = true">
            <PlusIcon class="size-4" />
            添加人员
          </Button>
        </div>
        <p v-if="staffLockHint" class="mb-3 text-xs text-muted-foreground">
          {{ staffLockHint }}
        </p>

        <StaffDataTable
          :loading="isStaffLoading"
          :data="staffList"
          :columns="staffColumns"
          :server-pagination="staffServerPagination"
        >
          <template #toolbar="{ table }">
            <StaffPanelToolbar
              :table="table"
              :search="staffSearch"
              :status-filter="staffStatusFilter"
              @update:search="staffSearch = $event"
              @update:status-filter="staffStatusFilter = $event"
              @reset="handleStaffReset"
            />
          </template>
        </StaffDataTable>
      </div>
    </template>

    <ServiceEdit
      v-if="isEditOpenRendered && org"
      v-model:open="isEditOpen"
      :service="org"
      @close="isEditOpen = false"
    />

    <Modal v-if="isDeleteOpenRendered && org" v-model:open="isDeleteOpen">
      <ModalContent>
        <ServiceDeleteContent :service="org" @close="isDeleteOpen = false" />
      </ModalContent>
    </Modal>

    <StaffEdit
      v-if="isStaffCreateOpenRendered && orgId"
      v-model:open="isStaffCreateOpen"
      :default-housekeeper-id="orgId"
      @close="isStaffCreateOpen = false"
    />
  </div>
</template>
