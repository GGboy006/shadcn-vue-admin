<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { ICommitteeAddDTO, ICommitteeUpdateDTO } from '@/services/api/merchant.api'

import { DatePicker } from '@/components/prop-ui/date-picker'
import { RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUpload } from '@/composables/use-upload'
import {
  useCreateCommitteeMutation,
  useGetCityNeighborhoodByRegionQuery,
  useUpdateCommitteeMutation,
} from '@/services/api/merchant.api'
import { CONTACT_PHONE_MAX_LENGTH, PHONE_MAX_LENGTH, showInvalidSubmitToast } from '@/validators/common'

import type { Merchant } from '../../merchants/data/schema'
import type { CommitteeValidator } from '../validators/committee.validator'

import { committeeValidator } from '../validators/committee.validator'

const { committee } = defineProps<{
  /** 编辑时传入列表项/详情;新建时为 undefined */
  committee?: Merchant
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const genders = [
  { value: 0, label: '未知' },
  { value: 1, label: '男' },
  { value: 2, label: '女' },
] as const

const statusList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!committee?.merchantId)

const initialValues = reactive<CommitteeValidator>({
  merchantId: committee?.merchantId,
  merchantCode: committee?.merchantCode || '',
  nickname: committee?.nickname || committee?.merchantName || '',
  phone: committee?.phone || '',
  password: '',
  avatar: committee?.avatar || '',
  gender: committee?.gender ?? 0,
  merchantName: committee?.merchantName || '',
  logo: committee?.logo || '',
  contactName: committee?.contactName || '',
  contactPhone: committee?.contactPhone || '',
  address: committee?.address || '',
  signDate: committee?.signDate || '',
  signFee: committee?.signFee ?? 0,
  serveResidents: committee?.serveResidents ?? undefined,
  members: committee?.members ?? undefined,
  remark: committee?.remark || '',
  contactUs: committee?.contactUs || '',
  status: committee?.status ?? 1,
})

const formSchema = toTypedSchema(committeeValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

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

// 新建时拉取本区域可绑定城市居委会列表
const { data: cityNeighborhoodRes, isLoading: isCityNeighborhoodLoading } = useGetCityNeighborhoodByRegionQuery(
  computed(() => !isEdit.value),
)
const cityNeighborhoodOptions = computed(() => cityNeighborhoodRes.value?.data ?? [])

const { mutate: createMutate, isPending: isCreating } = useCreateCommitteeMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateCommitteeMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

/** 选择城市居委会后，若昵称/名称/Logo 仍为空则预填城市库信息 */
function handleMerchantCodeChange(code: string | number | bigint | Record<string, any> | null) {
  const merchantCode = typeof code === 'string' ? code : ''
  setFieldValue('merchantCode', merchantCode)
  const selected = cityNeighborhoodOptions.value.find(item => item.merchantCode === merchantCode)
  if (!selected)
    return
  if (!formValues.nickname)
    setFieldValue('nickname', selected.nickName || selected.merchantName || '')
  if (!formValues.merchantName)
    setFieldValue('merchantName', selected.merchantName || '')
  if (!formValues.logo && selected.logo)
    setFieldValue('logo', selected.logo)
}

function buildPayload(values: CommitteeValidator): ICommitteeAddDTO | ICommitteeUpdateDTO {
  if (isEdit.value && committee) {
    return {
      merchantId: committee.merchantId,
      nickname: values.nickname || undefined,
      phone: values.phone || undefined,
      password: values.password || undefined,
      avatar: values.avatar || undefined,
      gender: values.gender as 0 | 1 | 2 | undefined,
      merchantName: values.merchantName || undefined,
      logo: values.logo || undefined,
      contactName: values.contactName || undefined,
      contactPhone: values.contactPhone || undefined,
      address: values.address || undefined,
      signDate: values.signDate || undefined,
      signFee: values.signFee ?? undefined,
      serveResidents: values.serveResidents ?? undefined,
      members: values.members ?? undefined,
      remark: values.remark || undefined,
      contactUs: values.contactUs || undefined,
      status: values.status as 1 | 2 | undefined,
    } as ICommitteeUpdateDTO
  }

  return {
    merchantCode: values.merchantCode || '',
    nickname: values.nickname,
    avatar: values.avatar || undefined,
    gender: values.gender as 0 | 1 | 2 | undefined,
    contactName: values.contactName || undefined,
    contactPhone: values.contactPhone || undefined,
    address: values.address || undefined,
    signDate: values.signDate || undefined,
    signFee: values.signFee ?? undefined,
    serveResidents: values.serveResidents ?? undefined,
    members: values.members ?? undefined,
    remark: values.remark || undefined,
    contactUs: values.contactUs || undefined,
    status: values.status as 1 | 2 | undefined,
  } as ICommitteeAddDTO
}

const onSubmit = handleSubmit((values) => {
  // 新建时校验 merchantCode 必填(zod 标记为可选,这里手动校验,避免编辑场景误报)
  if (!isEdit.value && !values.merchantCode) {
    toast.error('请选择城市居委会')
    return
  }

  const payload = buildPayload(values)

  if (isEdit.value && committee) {
    updateMutate(payload as ICommitteeUpdateDTO, {
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
    createMutate(payload as ICommitteeAddDTO, {
      onSuccess: () => {
        toast.success('创建成功')
        emits('close')
      },
      onError: (err: any) => {
        toast.error(err.message || '创建失败')
      },
    })
  }
}, showInvalidSubmitToast)
</script>

<template>
  <form class="space-y-6" @submit="onSubmit">
    <!-- 城市居委会标识（新建下拉选择，编辑只读） -->
    <FormField v-slot="{ componentField }" name="merchantCode">
      <FormItem>
        <FormLabel :required="!isEdit">
          城市居委会
        </FormLabel>
        <template v-if="isEdit">
          <FormControl>
            <Input
              type="text"
              :model-value="committee?.merchantName || componentField.modelValue"
              disabled
            />
          </FormControl>
          <p class="text-xs text-muted-foreground">
            已绑定，不可修改
          </p>
        </template>
        <template v-else>
          <Select
            :model-value="componentField.modelValue"
            @update:model-value="handleMerchantCodeChange"
          >
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="isCityNeighborhoodLoading ? '加载中...' : '请选择城市居委会'" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="item in cityNeighborhoodOptions"
                  :key="item.merchantCode"
                  :value="item.merchantCode"
                >
                  {{ item.merchantName || item.nickName || item.merchantCode }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p class="text-xs text-muted-foreground">
            选择本区域可绑定的城市居委会
          </p>
          <p v-if="!isCityNeighborhoodLoading && cityNeighborhoodOptions.length === 0" class="text-xs text-amber-600">
            暂无可绑定的城市居委会
          </p>
        </template>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 基本信息 -->
    <div class="space-y-4">
      <div class="text-sm font-medium text-muted-foreground">
        基本信息
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField v-slot="{ componentField }" name="merchantName">
          <FormItem class="md:col-span-2">
            <FormLabel>居委会名称</FormLabel>
            <FormControl>
              <Input type="text" placeholder="请输入居委会名称" v-bind="componentField" />
            </FormControl>
            <p v-if="!isEdit" class="text-xs text-muted-foreground">
              留空时后端从城市库拉取
            </p>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="nickname">
          <FormItem>
            <FormLabel required>
              管理员昵称
            </FormLabel>
            <FormControl>
              <Input type="text" placeholder="请输入管理员昵称" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="avatar">
          <FormItem>
            <FormLabel>头像</FormLabel>
            <FormControl>
              <div class="flex items-center gap-3">
                <img v-if="formValues.avatar" :src="formValues.avatar" alt="头像" class="h-10 w-10 rounded-full border object-cover">
                <div v-else class="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                  无
                </div>
                <label class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
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
            <FormLabel>登录手机号</FormLabel>
            <FormControl>
              <Input type="text" inputmode="numeric" :maxlength="PHONE_MAX_LENGTH" placeholder="留空时后端从城市库拉取" v-bind="componentField" :disabled="!isEdit" />
            </FormControl>
            <p v-if="!isEdit" class="text-xs text-muted-foreground">
              新建时由后端从城市库拉取
            </p>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel :required="false">
              {{ isEdit ? '登录密码（留空则不修改）' : '登录密码' }}
            </FormLabel>
            <FormControl>
              <Input type="password" :placeholder="isEdit ? '留空则不修改' : '新建时由后端从城市库拉取'" v-bind="componentField" :disabled="!isEdit" />
            </FormControl>
            <p v-if="!isEdit" class="text-xs text-muted-foreground">
              新建时由后端从城市库拉取
            </p>
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

    <!-- 居委会信息 -->
    <div class="space-y-4">
      <div class="text-sm font-medium text-muted-foreground">
        居委会信息
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField name="logo">
          <FormItem>
            <FormLabel>Logo</FormLabel>
            <FormControl>
              <div class="flex items-center gap-3">
                <img v-if="formValues.logo" :src="formValues.logo" alt="Logo" class="h-10 w-10 rounded border object-cover">
                <div v-else class="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                  无
                </div>
                <label class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                  <span>上传</span>
                  <input type="file" accept="image/*" class="sr-only" @change="(e: Event) => handleFileUpload(e, 'logo')">
                </label>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="serveResidents">
          <FormItem>
            <FormLabel>服务居民数</FormLabel>
            <FormControl>
              <Input type="number" placeholder="如:1468" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="members">
          <FormItem>
            <FormLabel>成员数</FormLabel>
            <FormControl>
              <Input type="number" placeholder="如:10" v-bind="componentField" />
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

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <FormItem class="md:col-span-2">
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

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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

    <!-- 简介 -->
    <div class="space-y-4">
      <div class="text-sm font-medium text-muted-foreground">
        简介
      </div>

      <FormField v-slot="{ componentField }" name="remark">
        <FormItem>
          <FormControl>
            <Textarea v-bind="componentField" placeholder="请输入居委会简介" rows="3" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 联系我们 -->
    <div class="space-y-4">
      <div class="text-sm font-medium text-muted-foreground">
        联系我们
      </div>

      <FormField name="contactUs">
        <FormItem>
          <FormControl>
            <RichTextEditor
              :model-value="formValues.contactUs ?? ''"
              placeholder="请输入联系我们内容"
              :min-height="200"
              @update:model-value="setFieldValue('contactUs', $event ?? '')"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
