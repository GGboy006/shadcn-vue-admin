<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { IHousekeeperStaff, IHousekeeperStaffSaveDTO } from '@/services/api/housekeeper.api'

import ImageUpload from '@/components/image-upload/image-upload.vue'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateHousekeeperStaffMutation, useGetHousekeeperServiceListQuery, useUpdateHousekeeperStaffMutation } from '@/services/api/housekeeper.api'
import { PHONE_MAX_LENGTH, showInvalidSubmitToast } from '@/validators/common'

import type { HousekeeperStaffValidator } from '../../validators/staff.validator'

import { housekeeperStaffValidator, joinStaffSkills, splitStaffSkills } from '../../validators/staff.validator'

const { staff, fixedHousekeeperId } = defineProps<{
  staff?: IHousekeeperStaff
  /** 嵌入机构详情时锁定所属主体 */
  fixedHousekeeperId?: string
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const enableStatusList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!staff?.staffId)

// 主体启用列表(下拉用)
const { data: serviceListData } = useGetHousekeeperServiceListQuery()
const serviceOptions = computed(() =>
  (serviceListData.value?.data ?? []).map(s => ({ value: s.housekeeperId, label: s.name })),
)

const initialValues = reactive<HousekeeperStaffValidator>({
  staffId: staff?.staffId || undefined,
  housekeeperId: staff?.housekeeperId ?? fixedHousekeeperId ?? '',
  staffName: staff?.staffName || '',
  phone: staff?.phone || '',
  avatar: staff?.avatar || undefined,
  serviceScope: staff?.serviceScope || undefined,
  serviceTime: staff?.serviceTime || undefined,
  serviceSkillsText: joinStaffSkills(staff?.serviceSkills),
  description: staff?.description || undefined,
  unitPrice: staff?.unitPrice ?? undefined,
  priceUnit: staff?.priceUnit || '次',
  sortOrder: staff?.sortOrder ?? undefined,
  status: staff?.status ?? 1,
})

const formSchema = toTypedSchema(housekeeperStaffValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const { mutate: createMutate, isPending: isCreating } = useCreateHousekeeperStaffMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateHousekeeperStaffMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: HousekeeperStaffValidator): IHousekeeperStaffSaveDTO {
  return {
    staffId: isEdit.value ? staff?.staffId : undefined,
    housekeeperId: values.housekeeperId,
    staffName: values.staffName,
    phone: values.phone || undefined,
    avatar: values.avatar || undefined,
    serviceScope: values.serviceScope || undefined,
    serviceTime: values.serviceTime || undefined,
    serviceSkills: splitStaffSkills(values.serviceSkillsText),
    description: values.description || undefined,
    unitPrice: values.unitPrice,
    priceUnit: values.priceUnit || '次',
    sortOrder: values.sortOrder ?? undefined,
    status: values.status as 1 | 2 | undefined,
  }
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && staff) {
    updateMutate(payload, {
      onSuccess: () => {
        toast.success('更新成功')
        emits('close')
      },
      onError: (err: any) => toast.error(err.message || '更新失败'),
    })
  }
  else {
    createMutate(payload, {
      onSuccess: () => {
        toast.success('创建成功')
        emits('close')
      },
      onError: (err: any) => toast.error(err.message || '创建失败'),
    })
  }
}, showInvalidSubmitToast)
</script>

<template>
  <div class="space-y-6">
    <form class="space-y-6" @submit="onSubmit">
      <!-- 所属主体 -->
      <FormField v-if="!fixedHousekeeperId" v-slot="{ componentField }" name="housekeeperId">
        <FormItem>
          <FormLabel required>
            所属主体
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择服务主体" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="s in serviceOptions" :key="s.value" :value="s.value">
                {{ s.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 人员姓名 与 电话 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
            <FormLabel required>
              电话
            </FormLabel>
            <FormControl>
              <Input type="text" inputmode="numeric" :maxlength="PHONE_MAX_LENGTH" placeholder="11 位手机号" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField v-slot="{ componentField }" name="serviceScope">
          <FormItem>
            <FormLabel>服务范围</FormLabel>
            <FormControl>
              <Input type="text" placeholder="如：本小区及周边" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="serviceTime">
          <FormItem>
            <FormLabel>服务时间</FormLabel>
            <FormControl>
              <Input type="text" placeholder="如：08:00 - 22:00" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <FormField v-slot="{ componentField }" name="serviceSkillsText">
        <FormItem>
          <FormLabel>服务技能</FormLabel>
          <FormControl>
            <Input type="text" placeholder="多个技能用顿号分隔，如：紧急开锁、汽车钥匙" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="description">
        <FormItem>
          <FormLabel>简介</FormLabel>
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

      <div class="grid grid-cols-1 gap-4 items-start md:grid-cols-2">
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
                <SelectItem v-for="s in enableStatusList" :key="s.value" :value="s.value">
                  {{ s.label }}
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
  </div>
</template>
