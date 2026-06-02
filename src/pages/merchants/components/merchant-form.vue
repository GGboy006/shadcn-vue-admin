<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { IMerchantAddDTO, IMerchantUpdateDTO } from '@/services/api/merchant.api'

import { DatePicker } from '@/components/prop-ui/date-picker'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUpload } from '@/composables/use-upload'
import { useCreateMerchantMutation, useUpdateMerchantMutation } from '@/services/api/merchant.api'

import type { Merchant } from '../data/schema'
import type { MerchantValidator } from '../validators/merchant.validator'

import { merchantValidator } from '../validators/merchant.validator'

const { merchant } = defineProps<{
  merchant?: Merchant
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const types = [
  { value: 4, label: '商户' },
  { value: 5, label: '物业' },
  { value: 6, label: '居委会' },
] as const

const genders = [
  { value: 0, label: '未知' },
  { value: 1, label: '男' },
  { value: 2, label: '女' },
] as const

const settlementCycles = [
  { value: 1, label: 'T+1' },
  { value: 2, label: 'T+7' },
  { value: 3, label: 'T+30' },
] as const

const statusList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!merchant?.merchantId)
const passwordLabel = computed(() => isEdit.value ? '登录密码（留空则不修改）' : '登录密码')

const { upload } = useUpload()

const initialValues = reactive<MerchantValidator>({
  merchantName: merchant?.merchantName || '',
  nickname: merchant?.nickname || merchant?.merchantName || '',
  phone: merchant?.phone || '',
  password: '',
  type: merchant?.type || 4,
  gender: merchant?.gender ?? 0,
  avatar: merchant?.avatar || '',
  logo: merchant?.logo || '',
  contactName: merchant?.contactName || '',
  contactPhone: merchant?.contactPhone || '',
  address: merchant?.address || '',
  externalUrl: merchant?.externalUrl || '',
  signDate: merchant?.signDate || '',
  signFee: merchant?.signFee || 0,
  businessHours: merchant?.businessHours || '',
  settlementCycle: merchant?.settlementCycle || 1,
  remark: merchant?.remark || '',
  status: merchant?.status || 1,
})

const merchantFormSchema = toTypedSchema(merchantValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: merchantFormSchema,
  initialValues,
})

async function handleFileUpload(event: Event, field: 'avatar' | 'logo') {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return

  try {
    const url = await upload(file)
    setFieldValue(field, url)
  }
  catch {
    // error handled by useUpload
  }
  finally {
    target.value = ''
  }
}

const currentType = computed(() => Number(formValues.type) as 4 | 5 | 6)

const { mutate: createMutate, isPending: isCreating } = useCreateMerchantMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateMerchantMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: MerchantValidator): IMerchantAddDTO | IMerchantUpdateDTO {
  const basePayload = {
    merchantName: values.merchantName,
    nickname: values.nickname,
    phone: values.phone,
    type: values.type as 4 | 5 | 6,
    gender: values.gender as 0 | 1 | 2,
    avatar: values.avatar || undefined,
    logo: values.logo || undefined,
    contactName: values.contactName || undefined,
    contactPhone: values.contactPhone || undefined,
    address: values.address || undefined,
    externalUrl: values.externalUrl || undefined,
    signDate: values.signDate || undefined,
    signFee: values.signFee || undefined,
    businessHours: values.businessHours || undefined,
    settlementCycle: values.settlementCycle as 1 | 2 | 3,
    remark: values.remark || undefined,
    status: values.status as 1 | 2,
  }

  if (isEdit.value && merchant) {
    const payload: IMerchantUpdateDTO = {
      merchantId: merchant.merchantId,
      ...basePayload,
    }
    if (values.password) {
      payload.password = values.password
    }
    return payload
  }

  const payload: IMerchantAddDTO = {
    ...basePayload,
    password: values.password!,
  }
  return payload
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && merchant) {
    updateMutate(payload as IMerchantUpdateDTO, {
      onSuccess: () => {
        toast.success('更新成功')
        emits('close')
      },
      onError: (err: any) => {
        toast.error(err.message || '更新失败')
      },
    })
  }
  else {
    createMutate(payload as IMerchantAddDTO, {
      onSuccess: () => {
        toast.success('创建成功')
        emits('close')
      },
      onError: (err: any) => {
        toast.error(err.message || '创建失败')
      },
    })
  }
})
</script>

<template>
  <div class="max-h-[600px] overflow-y-auto">
    <form class="space-y-6" @submit="onSubmit">
      <!-- 类型：编辑时只读，新增时可选 -->
      <FormField v-slot="{ componentField }" name="type">
        <FormItem>
          <FormLabel>类型</FormLabel>
          <FormControl>
            <template v-if="isEdit">
              <div class="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                {{ types.find(t => t.value === merchant?.type)?.label }}
              </div>
            </template>
            <Select v-else v-bind="componentField">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="t in types" :key="t.value" :value="t.value">
                    {{ t.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 基本信息 -->
      <div class="space-y-4">
        <div class="text-sm font-medium text-muted-foreground">
          基本信息
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <FormField v-slot="{ componentField }" name="merchantName">
            <FormItem class="col-span-full md:col-span-2">
              <FormLabel required>
                商户/物业名称
              </FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="nickname">
            <FormItem>
              <FormLabel required>
                昵称
              </FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="avatar">
            <FormItem>
              <FormLabel>头像</FormLabel>
              <FormControl>
                <div class="flex items-center gap-3">
                  <img
                    v-if="formValues.avatar"
                    :src="formValues.avatar"
                    alt="头像"
                    class="h-10 w-10 rounded-full object-cover border"
                  >
                  <div
                    v-else
                    class="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground"
                  >
                    无
                  </div>
                  <label
                    class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  >
                    <span>上传</span>
                    <input
                      type="file"
                      accept="image/*"
                      class="sr-only"
                      @change="(e: Event) => handleFileUpload(e, 'avatar')"
                    >
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="phone">
            <FormItem>
              <FormLabel required>
                手机号
              </FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel :required="!isEdit">
                {{ passwordLabel }}
              </FormLabel>
              <FormControl>
                <Input type="password" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="gender">
            <FormItem>
              <FormLabel>性别</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <FormControl>
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem v-for="g in genders" :key="g.value" :value="g.value">
                        {{ g.label }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="status">
            <FormItem>
              <FormLabel>状态</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <FormControl>
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem v-for="s in statusList" :key="s.value" :value="s.value">
                        {{ s.label }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </div>

      <!-- 联系信息 -->
      <div class="space-y-4">
        <div class="text-sm font-medium text-muted-foreground">
          联系信息
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <FormField v-slot="{ componentField }" name="contactName">
            <FormItem>
              <FormLabel>联系人</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="contactPhone">
            <FormItem>
              <FormLabel>联系电话</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="address">
            <FormItem class="col-span-full md:col-span-2">
              <FormLabel>详细地址</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </div>

      <!-- 签约信息 -->
      <div class="space-y-4">
        <div class="text-sm font-medium text-muted-foreground">
          签约信息
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <FormField v-slot="{ componentField }" name="signDate">
            <FormItem>
              <FormLabel>签约日期</FormLabel>
              <FormControl>
                <DatePicker v-bind="componentField" placeholder="选择签约日期" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="signFee">
            <FormItem>
              <FormLabel>签约费用</FormLabel>
              <FormControl>
                <Input type="number" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </div>

      <!-- 商户专属 -->
      <template v-if="currentType === 4">
        <div class="space-y-4">
          <div class="text-sm font-medium text-muted-foreground">
            商户信息
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormField name="logo">
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <div class="flex items-center gap-3">
                    <img
                      v-if="formValues.logo"
                      :src="formValues.logo"
                      alt="Logo"
                      class="h-10 w-10 rounded object-cover border"
                    >
                    <div
                      v-else
                      class="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground"
                    >
                      无
                    </div>
                    <label
                      class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    >
                      <span>上传</span>
                      <input
                        type="file"
                        accept="image/*"
                        class="sr-only"
                        @change="(e: Event) => handleFileUpload(e, 'logo')"
                      >
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="businessHours">
              <FormItem>
                <FormLabel>营业时间</FormLabel>
                <FormControl>
                  <Input type="text" v-bind="componentField" placeholder="如：09:00-22:00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="settlementCycle">
              <FormItem>
                <FormLabel>结算周期</FormLabel>
                <FormControl>
                  <Select v-bind="componentField">
                    <FormControl>
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="选择结算周期" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem v-for="c in settlementCycles" :key="c.value" :value="c.value">
                          {{ c.label }}
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </div>
      </template>

      <!-- 物业专属 -->
      <template v-if="currentType === 5">
        <div class="space-y-4">
          <div class="text-sm font-medium text-muted-foreground">
            物业信息
          </div>

          <FormField v-slot="{ componentField }" name="externalUrl">
            <FormItem>
              <FormLabel>外部链接</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" placeholder="外部链接URL" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </template>

      <!-- 备注 -->
      <div class="space-y-4">
        <div class="text-sm font-medium text-muted-foreground">
          备注
        </div>

        <FormField v-slot="{ componentField }" name="remark">
          <FormItem>
            <FormControl>
              <Textarea v-bind="componentField" placeholder="请输入备注" rows="3" />
            </FormControl>
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
