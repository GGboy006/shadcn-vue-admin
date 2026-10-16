<script setup lang="ts">
import type { DateValue } from '@internationalized/date'

import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IHousekeeperOrder } from '@/services/api/housekeeper-order.api'

import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { buildAppointmentSlots, isOpenOnDate } from '@/services/api/housekeeper-hours'
import { useReassignHousekeeperOrderMutation } from '@/services/api/housekeeper-order.api'
import { useGetHousekeeperServiceDetailQuery, useGetHousekeeperStaffListQuery } from '@/services/api/housekeeper.api'

const props = defineProps<{
  open: boolean
  order: IHousekeeperOrder
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const staffId = ref<string | undefined>()
const remark = ref('')
const slotDate = ref<string>()
const selectedSlot = ref<{ start: string, end: string }>()

const housekeeperId = computed(() => props.open ? props.order.housekeeperId : undefined)
const { data: staffListData, isLoading: isStaffLoading } = useGetHousekeeperStaffListQuery(housekeeperId)
const staffOptions = computed(() => staffListData.value?.data ?? [])
const { data: serviceData, isLoading: isServiceLoading } = useGetHousekeeperServiceDetailQuery(housekeeperId)
const service = computed(() => serviceData.value?.data)

const { mutate, isPending } = useReassignHousekeeperOrderMutation()
const minDate = today(getLocalTimeZone())

const selectedCalendarDate = computed(() => {
  if (!slotDate.value)
    return undefined
  const [year, month, day] = slotDate.value.split('-').map(Number)
  if (!year || !month || !day)
    return undefined
  return new CalendarDate(year, month, day)
})

const slots = computed(() => {
  if (!slotDate.value || !service.value)
    return []
  return buildAppointmentSlots({
    date: slotDate.value,
    openTime: service.value.openTime,
    closeTime: service.value.closeTime,
    openDays: service.value.openDays,
  })
})

const slotHint = computed(() => {
  if (!props.order.housekeeperId)
    return '该订单没有关联服务馆，只能改派人员。'
  if (isServiceLoading.value)
    return '正在读取营业时间...'
  if (!service.value?.openTime || !service.value.closeTime || !service.value.openDays)
    return '该馆还没有营业时间，请先补全后再改预约。不选档则保持原预约。'
  if (!slotDate.value)
    return '不选日期则保持原预约。'
  if (!isOpenOnDate(slotDate.value, service.value.openDays))
    return '这天闭馆。'
  if (!slots.value.length)
    return '这一天没有可改的档。开始时间要晚于现在 1 小时。'
  return '选中一档后，开始和结束会一起提交。'
})

watch(isOpen, (open) => {
  if (!open)
    return
  staffId.value = props.order.staffId
  remark.value = ''
  slotDate.value = undefined
  selectedSlot.value = undefined
})

function isClosedDay(date: DateValue) {
  if (!service.value?.openDays)
    return false
  const iso = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  return !isOpenOnDate(iso, service.value.openDays)
}

function onSelectDate(date: DateValue | undefined) {
  selectedSlot.value = undefined
  if (!date) {
    slotDate.value = undefined
    return
  }
  slotDate.value = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

function selectSlot(slot: { start: string, end: string }) {
  selectedSlot.value = selectedSlot.value?.start === slot.start ? undefined : slot
}

function handleClose() {
  emit('update:open', false)
}

function handleSubmit() {
  if (!staffId.value) {
    toast.error('请选择服务人员')
    return
  }
  mutate({
    orderId: props.order.orderId,
    staffId: staffId.value,
    appointmentTime: selectedSlot.value?.start,
    appointmentEndTime: selectedSlot.value?.end,
    remark: remark.value,
  }, {
    onSuccess: () => {
      toast.success(selectedSlot.value ? '已改派并更新预约档' : '已改派，预约时间不变')
      handleClose()
    },
    onError: (err: any) => toast.error(err.message || '改派失败'),
  })
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-lg">
      <ModalHeader>
        <ModalTitle class="text-base">
          改派服务人员
        </ModalTitle>
        <ModalDescription>
          改派后订单回到待接单。不选档则保持原预约，改时间须选该馆营业时间内的 60 分钟档。
        </ModalDescription>
      </ModalHeader>

      <div class="max-h-[70vh] space-y-4 overflow-y-auto py-2">
        <div class="space-y-2">
          <Label>服务人员</Label>
          <Select v-model="staffId">
            <SelectTrigger>
              <SelectValue :placeholder="isStaffLoading ? '加载人员...' : '选择师傅'" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="staff in staffOptions"
                :key="staff.staffId"
                :value="staff.staffId"
              >
                {{ staff.staffName }}{{ staff.phone ? ` · ${staff.phone}` : '' }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="!housekeeperId" class="text-xs text-muted-foreground">
            该订单没有关联服务馆，无法加载人员。
          </p>
          <p v-else-if="!isStaffLoading && staffOptions.length === 0" class="text-xs text-muted-foreground">
            该馆暂无启用人员。
          </p>
        </div>

        <div class="space-y-2">
          <Label>预约档（选填）</Label>
          <p class="text-sm text-muted-foreground">
            原预约 {{ order.appointmentTime || '-' }}<template v-if="order.appointmentEndTime">
              至 {{ order.appointmentEndTime }}
            </template>
          </p>
          <Calendar
            :model-value="selectedCalendarDate"
            :min-value="minDate"
            :is-date-unavailable="isClosedDay"
            class="rounded-md border p-2"
            @update:model-value="onSelectDate"
          />
          <div v-if="slots.length" class="grid grid-cols-2 gap-2">
            <Button
              v-for="slot in slots"
              :key="slot.start"
              type="button"
              :variant="selectedSlot?.start === slot.start ? 'default' : 'outline'"
              @click="selectSlot(slot)"
            >
              {{ slot.label }}
            </Button>
          </div>
          <p class="text-xs text-muted-foreground">
            {{ slotHint }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="reassign-remark">备注（选填）</Label>
          <Textarea
            id="reassign-remark"
            v-model="remark"
            maxlength="200"
            rows="3"
            placeholder="最多 200 字，会写入状态日志"
          />
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" :disabled="isPending" @click="handleClose">
          返回
        </Button>
        <Button :disabled="isPending || !staffId" @click="handleSubmit">
          <LoaderIcon v-if="isPending" class="mr-1 size-4 animate-spin" />
          {{ isPending ? '改派中...' : '确认改派' }}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
</template>
