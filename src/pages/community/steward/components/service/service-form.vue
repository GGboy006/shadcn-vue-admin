<script lang="ts" setup>
import { LoaderIcon } from '@lucide/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { IHousekeeperService, IHousekeeperServiceSaveDTO } from '@/services/api/housekeeper.api'

import ImageUpload from '@/components/image-upload/image-upload.vue'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUpload } from '@/composables/use-upload'
import { buildStationHousekeeperSavePayload, HOUSEKEEPER_PROVIDER_LOCAL, HOUSEKEEPER_PROVIDER_THIRD_PARTY, isHousekeeperAccountOpened } from '@/services/api/housekeeper-account'
import { useCreateHousekeeperServiceMutation, useGetHousekeeperFulfillProvidersQuery, useUpdateHousekeeperServiceMutation } from '@/services/api/housekeeper.api'
import { CONTACT_PHONE_MAX_LENGTH, PHONE_MAX_LENGTH, showInvalidSubmitToast } from '@/validators/common'

import type { HousekeeperServiceValidator } from '../../validators/service.validator'

import { housekeeperServiceValidator } from '../../validators/service.validator'

const { service } = defineProps<{
  service?: IHousekeeperService
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const enableStatusList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!service?.housekeeperId)
const accountOpened = computed(() => isHousekeeperAccountOpened(service))
const payModeOptions = [
  { value: 1, label: '线上支付' },
  { value: 2, label: '线下支付' },
] as const
const providerOptions = [
  { value: HOUSEKEEPER_PROVIDER_LOCAL, label: '本地馆' },
  { value: HOUSEKEEPER_PROVIDER_THIRD_PARTY, label: '第三方网点' },
] as const

const initialValues = reactive<HousekeeperServiceValidator>({
  housekeeperId: service?.housekeeperId || undefined,
  name: service?.name || '',
  description: service?.description || undefined,
  icon: service?.icon || undefined,
  coverImage: service?.coverImage || undefined,
  contactName: service?.contactName || undefined,
  contactPhone: service?.contactPhone || undefined,
  merchantId: service?.merchantId ?? undefined,
  sortOrder: service?.sortOrder ?? undefined,
  status: service?.status ?? 1,
  providerType: service?.providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY ? HOUSEKEEPER_PROVIDER_THIRD_PARTY : HOUSEKEEPER_PROVIDER_LOCAL,
  providerCode: service?.providerCode || undefined,
  loginPhone: service?.loginPhone || undefined,
  password: undefined,
  accountOpened: isHousekeeperAccountOpened(service),
  payMode: service?.payMode === 2 ? 2 : 1,
})

const formSchema = toTypedSchema(housekeeperServiceValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const { mutate: createMutate, isPending: isCreating } = useCreateHousekeeperServiceMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateHousekeeperServiceMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

// 封面上传
const { upload } = useUpload()
const isUploading = ref(false)
async function handleCoverUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return
  isUploading.value = true
  try {
    const url = await upload(file)
    setFieldValue('coverImage', url)
  }
  catch {
    // error handled by useUpload
  }
  finally {
    isUploading.value = false
    target.value = ''
  }
}

const isThirdParty = computed(() => Number(formValues.providerType) === HOUSEKEEPER_PROVIDER_THIRD_PARTY)
const { data: fulfillProviders } = useGetHousekeeperFulfillProvidersQuery(isThirdParty)
const channelOptions = computed(() => fulfillProviders.value?.data ?? [])

function buildPayload(values: HousekeeperServiceValidator): IHousekeeperServiceSaveDTO {
  return buildStationHousekeeperSavePayload({
    housekeeperId: isEdit.value ? service?.housekeeperId : undefined,
    name: values.name,
    description: values.description || undefined,
    icon: values.icon || undefined,
    coverImage: values.coverImage || undefined,
    contactName: values.contactName || undefined,
    contactPhone: values.contactPhone || undefined,
    merchantId: values.merchantId ?? undefined,
    sortOrder: values.sortOrder ?? undefined,
    status: values.status as 1 | 2 | undefined,
    providerType: Number(values.providerType) === HOUSEKEEPER_PROVIDER_THIRD_PARTY ? HOUSEKEEPER_PROVIDER_THIRD_PARTY : HOUSEKEEPER_PROVIDER_LOCAL,
    providerCode: values.providerCode,
    loginPhone: values.loginPhone,
    password: values.password,
    payMode: Number(values.payMode) === 2 ? 2 : 1,
  })
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && service) {
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
      <!-- 服务名称 -->
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel required>
            服务名称
          </FormLabel>
          <FormControl>
            <Input type="text" placeholder="请输入服务名称" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="providerType">
        <FormItem>
          <FormLabel required>
            网点类型
          </FormLabel>
          <Select v-bind="componentField" :disabled="accountOpened">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择网点类型" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="item in providerOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs text-muted-foreground">
            {{ accountOpened ? '已开通登录账号的馆不能改为第三方网点' : '第三方网点不开登录账号，也不能添加师傅' }}
          </p>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-if="!isThirdParty" v-slot="{ componentField }" name="payMode">
        <FormItem>
          <FormLabel>支付方式</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择支付方式" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="item in payModeOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs text-muted-foreground">
            下单时会抄到订单上。之后改这里，已经下的单不变。
          </p>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-if="isThirdParty" v-slot="{ componentField }" name="providerCode">
        <FormItem>
          <FormLabel required>
            第三方渠道
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择已授权渠道" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="item in channelOptions" :key="item.providerCode" :value="item.providerCode">
                {{ item.providerName }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField v-slot="{ componentField }" name="loginPhone">
          <FormItem>
            <FormLabel :required="!isEdit">
              登录手机号
            </FormLabel>
            <FormControl>
              <Input type="tel" :maxlength="PHONE_MAX_LENGTH" placeholder="管家登录本后台的手机号" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel :required="!isEdit">
              登录密码
            </FormLabel>
            <FormControl>
              <Input type="password" autocomplete="new-password" placeholder="不修改请留空" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- 封面图 -->
      <FormField name="coverImage">
        <FormItem>
          <FormLabel>封面图</FormLabel>
          <FormControl>
            <div class="flex items-center gap-3">
              <img v-if="formValues.coverImage" :src="formValues.coverImage" alt="封面" class="h-16 w-28 rounded border object-cover">
              <div v-else class="flex h-16 w-28 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                无
              </div>
              <label class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                <LoaderIcon v-if="isUploading" class="size-4 animate-spin" />
                <span>{{ isUploading ? '上传中' : '上传' }}</span>
                <input type="file" accept="image/*" class="sr-only" @change="handleCoverUpload">
              </label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 图标 -->
      <FormField name="icon">
        <FormItem>
          <FormLabel>图标</FormLabel>
          <FormControl>
            <ImageUpload
              :model-value="formValues.icon"
              alt="图标"
              @update:model-value="(url) => setFieldValue('icon', url)"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 描述 -->
      <FormField v-slot="{ componentField }" name="description">
        <FormItem>
          <FormLabel>描述</FormLabel>
          <FormControl>
            <Textarea v-bind="componentField" placeholder="请输入服务描述" rows="2" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 联系人 与 联系电话 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField v-slot="{ componentField }" name="contactName">
          <FormItem>
            <FormLabel>联系人</FormLabel>
            <FormControl>
              <Input type="text" placeholder="联系人姓名" v-bind="componentField" />
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
      </div>

      <!-- 商户ID、排序 与 状态 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <FormField v-slot="{ componentField }" name="merchantId">
          <FormItem>
            <FormLabel>商户ID</FormLabel>
            <FormControl>
              <Input type="text" placeholder="关联商户ID" v-bind="componentField" />
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
