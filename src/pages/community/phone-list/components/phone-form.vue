<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { ICommunityPhone, ICommunityPhoneSaveDTO } from '@/services/api/community-phone.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpload } from '@/composables/use-upload'
import { useCreatePhoneMutation, useUpdatePhoneMutation } from '@/services/api/community-phone.api'
import { CONTACT_PHONE_MAX_LENGTH, showInvalidSubmitToast } from '@/validators/common'

import type { CommunityPhoneValidator } from '../validators/phone.validator'

import { communityPhoneValidator } from '../validators/phone.validator'

const { phone } = defineProps<{
  phone?: ICommunityPhone
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

// 电话类型(对接文档 7 节 · type:1=管理员,2=服务)
const typeList = [
  { value: 1, label: '管理员' },
  { value: 2, label: '服务' },
] as const

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!phone?.uniqueCode)

const initialValues = reactive<CommunityPhoneValidator>({
  uniqueCode: phone?.uniqueCode || undefined,
  title: phone?.title || '',
  poster: phone?.poster || '',
  type: phone?.type ?? undefined,
  isEnable: phone?.isEnable ?? 1,
  regionPhone: phone?.regionPhone || '',
  workTime: phone?.workTime || '',
  contactUser: phone?.contactUser || '',
  contactPhone: phone?.contactPhone || '',
  customerServiceWeixin: phone?.customerServiceWeixin || '',
  wechatQrcode: phone?.wechatQrcode || '',
})

const formSchema = toTypedSchema(communityPhoneValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const { upload } = useUpload()
async function handleFileUpload(event: Event, field: 'poster' | 'wechatQrcode') {
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

const { mutate: createMutate, isPending: isCreating } = useCreatePhoneMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdatePhoneMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: CommunityPhoneValidator): ICommunityPhoneSaveDTO {
  return {
    uniqueCode: isEdit.value && phone ? phone.uniqueCode : undefined,
    title: values.title,
    poster: values.poster || undefined,
    type: values.type as ICommunityPhoneSaveDTO['type'],
    isEnable: values.isEnable as ICommunityPhoneSaveDTO['isEnable'],
    regionPhone: values.regionPhone || undefined,
    workTime: values.workTime || undefined,
    contactUser: values.contactUser || undefined,
    contactPhone: values.contactPhone || undefined,
    customerServiceWeixin: values.customerServiceWeixin || undefined,
    wechatQrcode: values.wechatQrcode || undefined,
  }
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && phone) {
    updateMutate(payload, {
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
    createMutate(payload, {
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
    <!-- 标题 -->
    <FormField v-slot="{ componentField }" name="title">
      <FormItem>
        <FormLabel required>
          标题
        </FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入标题" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 电话类型 + 启用状态 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="type">
        <FormItem>
          <FormLabel>电话类型</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择电话类型" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="t in typeList" :key="t.value" :value="t.value">
                  {{ t.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="isEnable">
        <FormItem>
          <FormLabel>启用状态</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="s in enableList" :key="s.value" :value="s.value">
                  {{ s.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 图片 -->
    <FormField name="poster">
      <FormItem>
        <FormLabel>图片</FormLabel>
        <FormControl>
          <div class="flex items-center gap-3">
            <img v-if="formValues.poster" :src="formValues.poster" alt="图片" class="size-16 rounded border object-cover">
            <div v-else class="flex size-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
              无
            </div>
            <label class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              <span>上传</span>
              <input type="file" accept="image/*" class="sr-only" @change="handleFileUpload($event, 'poster')">
            </label>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 值班信息 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="regionPhone">
        <FormItem>
          <FormLabel>值班电话</FormLabel>
          <FormControl>
            <Input type="tel" :maxlength="CONTACT_PHONE_MAX_LENGTH" placeholder="支持手机号、固话或短号" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="workTime">
        <FormItem>
          <FormLabel>工作时间</FormLabel>
          <FormControl>
            <Input type="text" placeholder="如:周一至周五 9:00-18:00" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 联系信息 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="contactUser">
        <FormItem>
          <FormLabel>联系人</FormLabel>
          <FormControl>
            <Input type="text" placeholder="联系人" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="contactPhone">
        <FormItem>
          <FormLabel>联系电话</FormLabel>
          <FormControl>
            <Input type="tel" :maxlength="CONTACT_PHONE_MAX_LENGTH" placeholder="支持手机号、固话或短号" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 客服微信 -->
    <FormField v-slot="{ componentField }" name="customerServiceWeixin">
      <FormItem>
        <FormLabel>客服微信</FormLabel>
        <FormControl>
          <Input type="text" placeholder="客服微信号" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 微信二维码 -->
    <FormField name="wechatQrcode">
      <FormItem>
        <FormLabel>微信二维码</FormLabel>
        <FormControl>
          <div class="flex items-center gap-3">
            <img v-if="formValues.wechatQrcode" :src="formValues.wechatQrcode" alt="微信二维码" class="size-16 rounded border object-cover">
            <div v-else class="flex size-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
              无
            </div>
            <label class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              <span>上传</span>
              <input type="file" accept="image/*" class="sr-only" @change="handleFileUpload($event, 'wechatQrcode')">
            </label>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
