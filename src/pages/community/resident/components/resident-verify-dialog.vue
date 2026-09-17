<script setup lang="ts">
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IResident } from '@/services/api/resident.api'

import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { canAuditResidentVerify, useVerifyResidentMutation } from '@/services/api/resident.api'

const props = defineProps<{
  open: boolean
  resident: IResident
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const decision = ref<'pass' | 'reject'>('pass')
const remark = ref('')
const { mutate, isPending } = useVerifyResidentMutation()

watch(isOpen, (open) => {
  if (open) {
    decision.value = 'pass'
    remark.value = ''
  }
})

function handleClose() {
  emit('update:open', false)
}

function handleSubmit() {
  if (!canAuditResidentVerify(props.resident) || !props.resident.residentId)
    return

  const passed = decision.value === 'pass'
  const reason = remark.value.trim()
  if (!passed && !reason) {
    toast.error('驳回须填写原因')
    return
  }

  mutate({
    residentId: props.resident.residentId,
    body: passed ? { passed: true } : { passed: false, remark: reason },
  }, {
    onSuccess: () => {
      toast.success(passed ? '已通过认证' : '已驳回认证')
      handleClose()
    },
    onError: (err: any) => toast.error(err.message || '审核失败'),
  })
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-md">
      <ModalHeader>
        <ModalTitle class="text-base">
          审核认证
        </ModalTitle>
        <ModalDescription>
          {{ resident.nickname || resident.phone || resident.residentId }} · {{ resident.doorplate || [resident.buildingNo, resident.unitNo, resident.roomNo].filter(Boolean).join('-') || '未填住房' }}
        </ModalDescription>
      </ModalHeader>

      <div class="space-y-4 py-2">
        <RadioGroup v-model="decision" class="grid gap-2">
          <label class="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem value="pass" />
            通过
          </label>
          <label class="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem value="reject" />
            驳回
          </label>
        </RadioGroup>

        <div v-if="decision === 'reject'" class="space-y-2">
          <Label for="verify-remark">驳回原因</Label>
          <Textarea
            id="verify-remark"
            v-model="remark"
            maxlength="200"
            rows="3"
            placeholder="必填，最多 200 字，会回传给居民 App"
          />
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" :disabled="isPending" @click="handleClose">
          返回
        </Button>
        <Button :variant="decision === 'reject' ? 'destructive' : 'default'" :disabled="isPending" @click="handleSubmit">
          <LoaderIcon v-if="isPending" class="mr-1 size-4 animate-spin" />
          {{ isPending ? '提交中...' : '确认' }}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
</template>
