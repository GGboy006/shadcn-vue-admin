<route lang="yaml">
meta:
  roles: [4]
</route>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import MultiImageUpload from '@/components/merchant-business/multi-image-upload.vue'
import { DatePicker } from '@/components/prop-ui/date-picker'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUpload } from '@/composables/use-upload'
import {
  useGetMyMerchantInfoQuery,
  useUpdateMyMerchantInfoMutation,
} from '@/services/api/merchant-business.api'
import { CONTACT_PHONE_MAX_LENGTH, optionalContactPhone, optionalNumber, optionalPhone, optionalString, PHONE_MAX_LENGTH, showInvalidSubmitToast } from '@/validators/common'

import type { ProfileFormValues } from './data/payload'

import { buildProfilePayload } from './data/payload'

// 仅商户自身可访问(站长代客菜单已隐藏此项;meta.roles 限定 4)
const { data, isLoading } = useGetMyMerchantInfoQuery()
const info = computed(() => data.value?.data)

const profileSchema = z.object({
  merchantId: z.string(),
  type: z.number(),
  nickname: optionalString,
  phone: optionalPhone,
  password: optionalString,
  avatar: optionalString,
  gender: optionalNumber,
  merchantName: optionalString,
  logo: optionalString,
  bannerImages: z.array(z.string()).optional(),
  otherImages: z.array(z.string()).optional(),
  contactName: optionalString,
  contactPhone: optionalContactPhone,
  address: optionalString,
  externalUrl: optionalString,
  signDate: optionalString,
  signFee: optionalNumber,
  businessStatus: optionalNumber,
  businessHours: optionalString,
  consumptionPerCapita: optionalNumber,
  settlementCycle: optionalNumber,
  intro: optionalString,
  remark: optionalString,
  status: optionalNumber,
})

const { handleSubmit, setFieldValue, values: formValues, resetForm } = useForm({
  validationSchema: toTypedSchema(profileSchema),
  initialValues: {
    merchantId: '',
    type: 4,
    password: '',
    bannerImages: [],
    otherImages: [],
  } as ProfileFormValues,
})

// 信息加载后回填表单
watch(info, (val) => {
  if (!val)
    return
  // 后端可能返回 null,统一清洗为 undefined,避免 zod optional 校验失败
  resetForm({
    values: {
      merchantId: val.merchantId,
      type: val.type,
      nickname: val.nickname ?? undefined,
      phone: val.phone ?? undefined,
      password: '',
      avatar: val.avatar ?? undefined,
      gender: val.gender ?? undefined,
      merchantName: val.merchantName ?? undefined,
      logo: val.logo ?? undefined,
      bannerImages: val.bannerImages ?? [],
      otherImages: val.otherImages ?? [],
      contactName: val.contactName ?? undefined,
      contactPhone: val.contactPhone ?? undefined,
      address: val.address ?? undefined,
      externalUrl: val.externalUrl ?? undefined,
      signDate: val.signDate ?? undefined,
      signFee: val.signFee ?? undefined,
      businessStatus: val.businessStatus ?? undefined,
      businessHours: val.businessHours ?? undefined,
      consumptionPerCapita: val.consumptionPerCapita ?? undefined,
      settlementCycle: val.settlementCycle ?? undefined,
      intro: val.intro ?? undefined,
      remark: val.remark ?? undefined,
      status: val.status ?? undefined,
    } as ProfileFormValues,
  })
}, { immediate: true })

const genders = [
  { value: 0, label: '未知' },
  { value: 1, label: '男' },
  { value: 2, label: '女' },
] as const

const businessStatuses = [
  { value: 1, label: '营业中' },
  { value: 2, label: '休息中' },
  { value: 3, label: '已打烊' },
  { value: 4, label: '暂停营业' },
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

const { upload } = useUpload()
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

const { mutate, isPending } = useUpdateMyMerchantInfoMutation()

const onSubmit = handleSubmit((values) => {
  try {
    const payload = buildProfilePayload(values as ProfileFormValues)
    mutate(payload, {
      onSuccess: () => {
        toast.success('保存成功')
        setFieldValue('password', '')
      },
      onError: (err: any) => toast.error(err.message || '保存失败'),
    })
  }
  catch (err: any) {
    toast.error(err.message || '提交失败')
  }
}, showInvalidSubmitToast)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          商户资料
        </h1>
        <p class="text-sm text-muted-foreground">
          查看与编辑商户基本信息
        </p>
      </div>
    </div>

    <div v-if="isLoading" class="py-20 text-center text-muted-foreground">
      加载中...
    </div>

    <form v-else class="space-y-6" @submit="onSubmit">
      <!-- 基本信息 -->
      <div class="rounded-lg border p-6 space-y-4">
        <div class="text-sm font-medium text-muted-foreground">
          基本信息
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <FormField v-slot="{ componentField }" name="merchantName">
            <FormItem class="col-span-full md:col-span-2">
              <FormLabel>商户名称</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="nickname">
            <FormItem>
              <FormLabel>昵称</FormLabel>
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
                  <img v-if="formValues.avatar" :src="formValues.avatar" alt="头像" class="h-10 w-10 rounded-full object-cover border">
                  <div v-else class="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    无
                  </div>
                  <label class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground">
                    <span>上传</span>
                    <input type="file" accept="image/*" class="sr-only" @change="(e: Event) => handleFileUpload(e, 'avatar')">
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="phone">
            <FormItem>
              <FormLabel>手机号</FormLabel>
              <FormControl>
                <Input type="text" inputmode="numeric" :maxlength="PHONE_MAX_LENGTH" placeholder="11 位手机号" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>登录密码</FormLabel>
              <FormControl>
                <Input type="password" v-bind="componentField" placeholder="留空则不修改" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="gender">
            <FormItem>
              <FormLabel>性别</FormLabel>
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
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="status">
            <FormItem>
              <FormLabel>状态</FormLabel>
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
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </div>

      <!-- 联系信息 -->
      <div class="rounded-lg border p-6 space-y-4">
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
                <Input type="tel" :maxlength="CONTACT_PHONE_MAX_LENGTH" placeholder="支持手机号或固话" v-bind="componentField" />
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
      <div class="rounded-lg border p-6 space-y-4">
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

      <!-- 商户专属(type=4) -->
      <div v-if="formValues.type === 4" class="rounded-lg border p-6 space-y-4">
        <div class="text-sm font-medium text-muted-foreground">
          商户信息
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <FormField name="logo">
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <FormControl>
                <div class="flex items-center gap-3">
                  <img v-if="formValues.logo" :src="formValues.logo" alt="Logo" class="h-10 w-10 rounded object-cover border">
                  <div v-else class="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    无
                  </div>
                  <label class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground">
                    <span>上传</span>
                    <input type="file" accept="image/*" class="sr-only" @change="(e: Event) => handleFileUpload(e, 'logo')">
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
                <Input type="text" v-bind="componentField" placeholder="如:09:00-22:00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="businessStatus">
            <FormItem>
              <FormLabel>营业状态</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem v-for="b in businessStatuses" :key="b.value" :value="b.value">
                      {{ b.label }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="settlementCycle">
            <FormItem>
              <FormLabel>结算周期</FormLabel>
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
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="consumptionPerCapita">
            <FormItem>
              <FormLabel>人均消费</FormLabel>
              <FormControl>
                <Input type="number" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </div>

      <!-- 物业专属(type=5) -->
      <div v-if="formValues.type === 5" class="rounded-lg border p-6 space-y-4">
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

      <!-- 图片资源 -->
      <div class="rounded-lg border p-6 space-y-4">
        <div class="text-sm font-medium text-muted-foreground">
          图片资源
        </div>
        <FormField name="bannerImages">
          <FormItem>
            <FormLabel>轮播图</FormLabel>
            <FormControl>
              <MultiImageUpload v-model="formValues.bannerImages" :max="9" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="otherImages">
          <FormItem>
            <FormLabel>其他图</FormLabel>
            <FormControl>
              <MultiImageUpload v-model="formValues.otherImages" :max="9" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- 简介 -->
      <div class="rounded-lg border p-6 space-y-4">
        <div class="text-sm font-medium text-muted-foreground">
          简介
        </div>
        <FormField v-slot="{ componentField }" name="intro">
          <FormItem>
            <FormControl>
              <Textarea v-bind="componentField" placeholder="请输入商户简介" rows="3" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- 备注 -->
      <div class="rounded-lg border p-6 space-y-4">
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

      <div class="flex justify-end">
        <Button type="submit" :disabled="isPending">
          {{ isPending ? '保存中...' : '保存' }}
        </Button>
      </div>
    </form>
  </div>
</template>
