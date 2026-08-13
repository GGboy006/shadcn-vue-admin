<script setup lang="ts">
import { computed } from 'vue'

import type { IHousekeeperStaff } from '@/services/api/housekeeper.api'

import { ModalClose, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetHousekeeperServiceListQuery, useGetHousekeeperStaffListQuery } from '@/services/api/housekeeper.api'

interface ProviderItem {
  housekeeperId: number
  staffId: number
  housekeeperName?: string
  staffName?: string
  sortOrder: number
}

const props = defineProps<{
  open: boolean
  currentStaffIds: Set<number>
}>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'add': [item: ProviderItem]
  'remove': [staffId: number]
}>()

const isOpen = computed({
  get: () => props.open,
  set: v => emit('update:open', v),
})

const selectedHousekeeperId = ref<number | undefined>(undefined)

const { data: serviceListData } = useGetHousekeeperServiceListQuery()
const serviceOptions = computed(() =>
  (serviceListData.value?.data ?? []).map(s => ({ value: s.housekeeperId, label: s.name })),
)

const housekeeperIdRef = computed(() => selectedHousekeeperId.value)
const { data: staffListData, isLoading: isStaffLoading } = useGetHousekeeperStaffListQuery(housekeeperIdRef)
const staffList = computed(() => staffListData.value?.data ?? [])

function isChecked(staffId: number) {
  return props.currentStaffIds.has(staffId)
}

function handleToggle(staff: IHousekeeperStaff, val: boolean | string | number) {
  const checked = !!val
  if (checked) {
    const service = serviceListData.value?.data?.find(s => s.housekeeperId === staff.housekeeperId)
    emit('add', {
      housekeeperId: staff.housekeeperId,
      staffId: staff.staffId,
      housekeeperName: service?.name,
      staffName: staff.staffName,
      sortOrder: 0,
    })
  }
  else {
    emit('remove', staff.staffId)
  }
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-lg">
      <ModalHeader>
        <ModalTitle class="text-base">
          添加人员
        </ModalTitle>
        <ModalDescription>
          选择主体后勾选要分配的人员,已分配的默认勾选。
        </ModalDescription>
      </ModalHeader>

      <div class="space-y-4 px-1">
        <!-- 主体下拉 -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium">服务主体</label>
          <Select v-model="selectedHousekeeperId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="请选择服务主体" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="s in serviceOptions" :key="s.value" :value="s.value">
                {{ s.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- 人员列表 -->
        <div v-if="selectedHousekeeperId === undefined" class="py-8 text-center text-sm text-muted-foreground">
          请先选择服务主体
        </div>

        <div v-else-if="isStaffLoading" class="space-y-2">
          <Skeleton class="h-8 w-full" />
          <Skeleton class="h-8 w-full" />
          <Skeleton class="h-8 w-full" />
        </div>

        <div v-else-if="staffList.length === 0" class="py-8 text-center text-sm text-muted-foreground">
          该主体下暂无启用人员
        </div>

        <div v-else class="max-h-[40vh] space-y-1 overflow-y-auto rounded-md border p-2">
          <label
            v-for="staff in staffList"
            :key="staff.staffId"
            class="flex cursor-pointer items-center gap-3 rounded px-2 py-2 text-sm transition-colors hover:bg-accent"
          >
            <Checkbox
              :model-value="isChecked(staff.staffId)"
              @update:model-value="(val) => handleToggle(staff, val)"
            />
            <span class="flex-1 font-medium">{{ staff.staffName }}</span>
            <span v-if="staff.title" class="text-xs text-muted-foreground">{{ staff.title }}</span>
            <span v-if="staff.phone" class="text-xs text-muted-foreground">{{ staff.phone }}</span>
          </label>
        </div>
      </div>

      <ModalFooter>
        <ModalClose as-child>
          <Button variant="outline">
            完成
          </Button>
        </ModalClose>
      </ModalFooter>
    </ModalContent>
  </Modal>
</template>
