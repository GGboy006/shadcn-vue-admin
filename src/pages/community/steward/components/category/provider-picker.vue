<script setup lang="ts">
import type { CategoryAssignmentDraft } from '@/services/api/housekeeper-assignment'
import type { IHousekeeperStaff } from '@/services/api/housekeeper.api'

import { Modal, ModalClose, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { HOUSEKEEPER_PROVIDER_LOCAL, HOUSEKEEPER_PROVIDER_THIRD_PARTY } from '@/services/api/housekeeper-account'
import { assignmentKey } from '@/services/api/housekeeper-assignment'
import { useGetFulfillProviderStaffQuery } from '@/services/api/housekeeper-partner.api'
import { useGetHousekeeperFulfillProvidersQuery, useGetHousekeeperServiceListQuery, useGetHousekeeperStaffListQuery } from '@/services/api/housekeeper.api'

const props = defineProps<{
  open: boolean
  assigned: CategoryAssignmentDraft[]
}>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'add': [item: CategoryAssignmentDraft]
  'remove': [item: Pick<CategoryAssignmentDraft, 'housekeeperId' | 'staffId' | 'partnerStaffId' | 'providerType'>]
}>()

const isOpen = computed({
  get: () => props.open,
  set: v => emit('update:open', v),
})

const selectedHousekeeperId = ref<string | undefined>(undefined)
const listEnabled = computed(() => props.open)

const { data: serviceListData } = useGetHousekeeperServiceListQuery(listEnabled)
const { data: channelData } = useGetHousekeeperFulfillProvidersQuery(listEnabled)
const services = computed(() => serviceListData.value?.data ?? [])
const localServices = computed(() => services.value.filter(item => item.providerType !== HOUSEKEEPER_PROVIDER_THIRD_PARTY))
const thirdPartyServices = computed(() => services.value.filter(item => item.providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY))
const selectedService = computed(() => services.value.find(item => item.housekeeperId === selectedHousekeeperId.value))
const isThirdParty = computed(() => selectedService.value?.providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY)
const selectedMode = computed(() => {
  if (selectedService.value?.integrationMode)
    return selectedService.value.integrationMode
  const code = selectedService.value?.providerCode
  if (!code)
    return undefined
  return channelData.value?.data?.find(item => item.providerCode === code)?.integrationMode
})
const isPartnerChannel = computed(() => isThirdParty.value && selectedMode.value === 'PARTNER')

const staffHousekeeperId = computed(() => isThirdParty.value ? undefined : selectedHousekeeperId.value)
const { data: staffListData, isLoading: isStaffLoading } = useGetHousekeeperStaffListQuery(staffHousekeeperId)
const staffList = computed(() => staffListData.value?.data ?? [])

const partnerProviderCode = computed(() => isPartnerChannel.value ? selectedService.value?.providerCode : undefined)
const { data: partnerStaffData, isLoading: isPartnerStaffLoading } = useGetFulfillProviderStaffQuery(partnerProviderCode, listEnabled)
const partnerStaffList = computed(() => partnerStaffData.value?.data ?? [])

const assignedKeys = computed(() => new Set(props.assigned.map(item => assignmentKey(item))))

function isStaffChecked(staffId: string) {
  return assignedKeys.value.has(assignmentKey({
    housekeeperId: selectedHousekeeperId.value || '',
    staffId,
    providerType: HOUSEKEEPER_PROVIDER_LOCAL,
  }))
}

function isPartnerStaffChecked(staffId: string) {
  return assignedKeys.value.has(assignmentKey({
    housekeeperId: selectedHousekeeperId.value || '',
    partnerStaffId: staffId,
    providerType: HOUSEKEEPER_PROVIDER_THIRD_PARTY,
  }))
}

function isHouseChecked(housekeeperId: string) {
  return assignedKeys.value.has(`house:${housekeeperId}`)
}

function handleStaffToggle(staff: IHousekeeperStaff, val: boolean | string | number) {
  const service = selectedService.value
  if (!service)
    return
  if (val) {
    emit('add', {
      housekeeperId: service.housekeeperId,
      staffId: staff.staffId,
      housekeeperName: service.name,
      staffName: staff.staffName,
      sortOrder: 0,
      providerType: HOUSEKEEPER_PROVIDER_LOCAL,
    })
    return
  }
  emit('remove', { housekeeperId: service.housekeeperId, staffId: staff.staffId, providerType: HOUSEKEEPER_PROVIDER_LOCAL })
}

function handlePartnerStaffToggle(staff: { staffId: string, staffName: string }, val: boolean | string | number) {
  const service = selectedService.value
  if (!service)
    return
  if (val) {
    emit('add', {
      housekeeperId: service.housekeeperId,
      partnerStaffId: staff.staffId,
      housekeeperName: service.name,
      staffName: staff.staffName,
      sortOrder: 0,
      providerType: HOUSEKEEPER_PROVIDER_THIRD_PARTY,
      integrationMode: 'PARTNER',
    })
    return
  }
  emit('remove', {
    housekeeperId: service.housekeeperId,
    partnerStaffId: staff.staffId,
    providerType: HOUSEKEEPER_PROVIDER_THIRD_PARTY,
  })
}

function handleHouseToggle(val: boolean | string | number) {
  const service = selectedService.value
  if (!service)
    return
  if (val) {
    emit('add', {
      housekeeperId: service.housekeeperId,
      housekeeperName: service.name,
      sortOrder: 0,
      providerType: HOUSEKEEPER_PROVIDER_THIRD_PARTY,
      integrationMode: selectedMode.value,
    })
    return
  }
  emit('remove', { housekeeperId: service.housekeeperId, providerType: HOUSEKEEPER_PROVIDER_THIRD_PARTY })
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-lg">
      <ModalHeader>
        <ModalTitle class="text-base">
          添加分配
        </ModalTitle>
        <ModalDescription>
          本地馆勾选师傅。跳转和接口渠道按整馆分配，合作方可以整馆，也可以勾选具体人员。
        </ModalDescription>
      </ModalHeader>

      <div class="space-y-4 px-1">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">服务主体</label>
          <Select v-model="selectedHousekeeperId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="请选择服务主体" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup v-if="localServices.length">
                <SelectLabel>本地馆</SelectLabel>
                <SelectItem v-for="item in localServices" :key="item.housekeeperId" :value="item.housekeeperId">
                  {{ item.name }}
                </SelectItem>
              </SelectGroup>
              <SelectGroup v-if="thirdPartyServices.length">
                <SelectLabel>第三方</SelectLabel>
                <SelectItem v-for="item in thirdPartyServices" :key="item.housekeeperId" :value="item.housekeeperId">
                  {{ item.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div v-if="!selectedService" class="py-8 text-center text-sm text-muted-foreground">
          请先选择服务主体
        </div>

        <div v-else-if="isPartnerChannel" class="space-y-2">
          <label class="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-sm">
            <Checkbox
              :model-value="isHouseChecked(selectedService.housekeeperId)"
              @update:model-value="handleHouseToggle"
            />
            <span class="flex-1 font-medium">{{ selectedService.name }}</span>
            <span class="text-xs text-muted-foreground">合作方 · 整馆</span>
          </label>

          <div v-if="isPartnerStaffLoading" class="space-y-2">
            <Skeleton class="h-8 w-full" />
            <Skeleton class="h-8 w-full" />
          </div>
          <div v-else-if="partnerStaffList.length === 0" class="py-6 text-center text-sm text-muted-foreground">
            该渠道暂无启用人员，可以只分配整馆
          </div>
          <div v-else class="max-h-[40vh] space-y-1 overflow-y-auto rounded-md border p-2">
            <label
              v-for="staff in partnerStaffList"
              :key="staff.staffId"
              class="flex cursor-pointer items-center gap-3 rounded px-2 py-2 text-sm transition-colors hover:bg-accent"
            >
              <Checkbox
                :model-value="isPartnerStaffChecked(staff.staffId)"
                @update:model-value="(val) => handlePartnerStaffToggle(staff, val)"
              />
              <span class="flex-1 font-medium">{{ staff.staffName }}</span>
              <span v-if="staff.serviceSkills?.length" class="text-xs text-muted-foreground">{{ staff.serviceSkills.join('、') }}</span>
              <span v-if="staff.phone" class="text-xs text-muted-foreground">{{ staff.phone }}</span>
            </label>
          </div>
        </div>

        <label
          v-else-if="isThirdParty"
          class="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-sm"
        >
          <Checkbox
            :model-value="isHouseChecked(selectedService.housekeeperId)"
            @update:model-value="handleHouseToggle"
          />
          <span class="flex-1 font-medium">{{ selectedService.name }}</span>
          <span class="text-xs text-muted-foreground">第三方 · 整馆</span>
        </label>

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
              :model-value="isStaffChecked(staff.staffId)"
              @update:model-value="(val) => handleStaffToggle(staff, val)"
            />
            <span class="flex-1 font-medium">{{ staff.staffName }}</span>
            <span v-if="staff.serviceSkills?.length" class="text-xs text-muted-foreground">{{ staff.serviceSkills.join('、') }}</span>
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
