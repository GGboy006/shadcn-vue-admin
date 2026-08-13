<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { IHousekeeperStaff, IHousekeeperStaffSaveDTO } from '@/services/api/housekeeper.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateHousekeeperStaffMutation, useGetHousekeeperServiceListQuery, useUpdateHousekeeperStaffMutation } from '@/services/api/housekeeper.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { HousekeeperStaffValidator } from '../../validators/staff.validator'

import { housekeeperStaffValidator } from '../../validators/staff.validator'

const { staff } = defineProps<{
  staff?: IHousekeeperStaff
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
  housekeeperId: staff?.housekeeperId ?? '',
  staffName: staff?.staffName || '',
  phone: staff?.phone || undefined,
  avatar: staff?.avatar || undefined,
  title: staff?.title || undefined,
  userId: staff?.userId ?? undefined,
  sortOrder: staff?.sortOrder ?? undefined,
  status: staff?.status ?? 1,
})

const formSchema = toTypedSchema(housekeeperStaffValidator)
const { handleSubmit } = useForm({
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
    title: values.title || undefined,
    userId: values.userId ?? undefined,
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
      <FormField v-slot="{ componentField }" name="housekeeperId">
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
            <FormLabel>电话</FormLabel>
            <FormControl>
              <Input type="text" placeholder="联系电话" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- 职称 与 头像 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField v-slot="{ componentField }" name="title">
          <FormItem>
            <FormLabel>职称</FormLabel>
            <FormControl>
              <Input type="text" placeholder="如:高级家政师" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="avatar">
          <FormItem>
            <FormLabel>头像</FormLabel>
            <FormControl>
              <Input type="text" placeholder="头像 URL" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- 用户ID、排序 与 状态 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <FormField v-slot="{ componentField }" name="userId">
          <FormItem>
            <FormLabel>用户ID</FormLabel>
            <FormControl>
              <Input type="number" placeholder="关联用户ID" v-bind="componentField" />
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
