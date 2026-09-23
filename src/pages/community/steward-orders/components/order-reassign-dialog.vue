<script setup lang="ts">
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IHousekeeperOrder } from '@/services/api/housekeeper-order.api'

import { DateTimePicker } from '@/components/prop-ui/date-picker'
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useReassignHousekeeperOrderMutation } from '@/services/api/housekeeper-order.api'
import { useGetHousekeeperStaffListQuery } from '@/services/api/housekeeper.api'

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
const appointmentTime = ref<string | undefined>()
const remark = ref('')

const housekeeperId = computed(() => props.order.housekeeperId)
const { data: staffListData, isLoading: isStaffLoading } = useGetHousekeeperStaffListQuery(housekeeperId)
const staffOptions = computed(() => staffListData.value?.data ?? [])

const { mutate, isPending } = useReassignHousekeeperOrderMutation()

watch(isOpen, (open) => {
  if (!open)
    return
  staffId.value = props.order.staffId
  appointmentTime.value = props.order.appointmentTime
  remark.value = ''
})

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
    appointmentTime: appointmentTime.value || undefined,
    remark: remark.value,
  }, {
    onSuccess: () => {
      toast.success('已改派，新师傅需重新接单')
      handleClose()
    },
    onError: (err: any) => toast.error(err.message || '改派失败'),
  })
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-md">
      <ModalHeader>
        <ModalTitle class="text-base">
          改派服务人员
        </ModalTitle>
        <ModalDescription>
          改派后订单回到待接单，目标师傅需在工人端重新接单。
        </ModalDescription>
      </ModalHeader>

      <div class="space-y-4 py-2">
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
          <Label>预约时间（选填）</Label>
          <DateTimePicker
            v-model="appointmentTime"
            modal
            clearable
            placeholder="不改则保持原预约"
          />
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
