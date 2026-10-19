<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { IPartnerStaff, IPartnerStaffSaveDTO } from '@/services/api/housekeeper-partner.api'

import ImageUpload from '@/components/image-upload/image-upload.vue'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreatePartnerStaffMutation, useUpdatePartnerStaffMutation } from '@/services/api/housekeeper-partner.api'
import { CONTACT_PHONE_MAX_LENGTH, showInvalidSubmitToast } from '@/validators/common'

import type { PartnerStaffValidator } from './staff.validator'

import { joinStaffSkills, partnerStaffValidator, splitStaffSkills } from './staff.validator'

const { staff } = defineProps<{
  staff?: IPartnerStaff
}>()

const emit = defineEmits<{
  close: []
}>()

const enableStatusList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!staff?.staffId)

const initialValues = reactive<PartnerStaffValidator>({
  staffId: staff?.staffId || undefined,
  staffName: staff?.staffName || '',
  phone: staff?.phone || '',
  avatar: staff?.avatar || undefined,
  serviceScope: staff?.serviceScope || undefined,
  serviceSkillsText: joinStaffSkills(staff?.serviceSkills),
  description: staff?.description || undefined,
  unitPrice: staff?.unitPrice ?? undefined,
  priceUnit: staff?.priceUnit || '次',
  score: staff?.score ?? undefined,
  sortOrder: staff?.sortOrder ?? undefined,
  status: staff?.status ?? 1,
})

const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: toTypedSchema(partnerStaffValidator),
  initialValues,
})

const { mutate: createMutate, isPending: isCreating } = useCreatePartnerStaffMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdatePartnerStaffMutation()
const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: PartnerStaffValidator): IPartnerStaffSaveDTO {
  return {
    staffId: isEdit.value ? staff?.staffId : undefined,
    staffName: values.staffName,
    phone: values.phone || undefined,
    avatar: values.avatar || undefined,
    serviceScope: values.serviceScope || undefined,
    serviceSkills: splitStaffSkills(values.serviceSkillsText),
    description: values.description || undefined,
    unitPrice: values.unitPrice,
    priceUnit: values.priceUnit || undefined,
    score: values.score,
    sortOrder: values.sortOrder ?? undefined,
    status: values.status as 1 | 2 | undefined,
  }
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)
  const done = {
    onSuccess: () => {
      toast.success(isEdit.value ? '更新成功' : '创建成功')
      emit('close')
    },
    onError: (err: Error) => toast.error(err.message || '保存失败'),
  }
  if (isEdit.value)
    updateMutate(payload, done)
  else
    createMutate(payload, done)
}, showInvalidSubmitToast)
</script>

<template>
  <form class="space-y-6" @submit="onSubmit">
    <div class="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="staffName">
        <FormItem>
          <FormLabel required>
            人员姓名
          </FormLabel>
          <FormControl>
            <Input type="text" placeholder="请输入人员姓名" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="phone">
        <FormItem>
          <FormLabel>联系电话</FormLabel>
          <FormControl>
            <Input type="text" :maxlength="CONTACT_PHONE_MAX_LENGTH" placeholder="联系电话，不是登录号" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <FormField v-slot="{ componentField }" name="serviceScope">
      <FormItem>
        <FormLabel>服务范围</FormLabel>
        <FormControl>
          <Input type="text" placeholder="如：本小区及周边" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="serviceSkillsText">
      <FormItem>
        <FormLabel>服务技能</FormLabel>
        <FormControl>
          <Input type="text" placeholder="多个技能用顿号分隔" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="description">
      <FormItem>
        <FormLabel>描述</FormLabel>
        <FormControl>
          <Textarea rows="2" placeholder="从业经验、擅长说明" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="avatar">
      <FormItem>
        <FormLabel>头像</FormLabel>
        <FormControl>
          <ImageUpload
            :model-value="formValues.avatar"
            alt="头像"
            shape="circle"
            @update:model-value="(url) => setFieldValue('avatar', url)"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="unitPrice">
        <FormItem>
          <FormLabel>单价</FormLabel>
          <FormControl>
            <Input type="number" min="0" step="0.01" placeholder="0.00" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="priceUnit">
        <FormItem>
          <FormLabel>计价单位</FormLabel>
          <FormControl>
            <Input type="text" placeholder="次" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="score">
        <FormItem>
          <FormLabel>默认评分</FormLabel>
          <FormControl>
            <Input type="number" min="0" step="0.1" placeholder="0" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="sortOrder">
        <FormItem>
          <FormLabel>排序</FormLabel>
          <FormControl>
            <Input type="number" placeholder="数值越小越靠前" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="status">
        <FormItem>
          <FormLabel>状态</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="item in enableStatusList" :key="item.value" :value="item.value">
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
