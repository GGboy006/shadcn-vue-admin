<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { INeighborhoodService, INeighborhoodServiceAddDTO, INeighborhoodServiceUpdateDTO } from '@/services/api/neighborhood-service.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpload } from '@/composables/use-upload'
import { useCreateServiceMutation, useUpdateServiceMutation } from '@/services/api/neighborhood-service.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { ServiceValidator } from '../validators/service.validator'

import { serviceValidator } from '../validators/service.validator'

const { service } = defineProps<{
  service?: INeighborhoodService
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const typeList = [
  { value: 7, label: 'H5' },
  { value: 8, label: '专题' },
  { value: 27, label: '小程序' },
] as const

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!service?.uniqueCode)

const initialValues = reactive<ServiceValidator>({
  uniqueCode: service?.uniqueCode || undefined,
  name: service?.name || '',
  type: service?.type ?? 7,
  poster: service?.poster || '',
  appId: service?.appId || '',
  originalAppId: service?.originalAppId || '',
  bdAppKey: service?.bdAppKey || '',
  h5Url: service?.h5Url || '',
  torder: service?.torder ?? undefined,
  isEnable: service?.isEnable ?? 1,
  resCode: service?.resCode || '',
})

const formSchema = toTypedSchema(serviceValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

// type 切换决定显示哪些字段:7=H5(h5Url)、8=专题(resCode)、27=小程序(appId/originalAppId)
const currentType = computed(() => Number(formValues.type) as 7 | 8 | 27)
const isH5 = computed(() => currentType.value === 7)
const isSpecial = computed(() => currentType.value === 8)
const isMiniProgram = computed(() => currentType.value === 27)

const { upload } = useUpload()
async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return
  try {
    const url = await upload(file)
    setFieldValue('poster', url)
  }
  catch {
    // error handled by useUpload
  }
  finally {
    target.value = ''
  }
}

const { mutate: createMutate, isPending: isCreating } = useCreateServiceMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateServiceMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: ServiceValidator): INeighborhoodServiceAddDTO | INeighborhoodServiceUpdateDTO {
  const type = values.type as 7 | 8 | 27
  const isH5Type = type === 7
  const isMiniType = type === 27

  const basePayload = {
    name: values.name,
    type,
    poster: values.poster || undefined,
    // 小程序才传 appId/originalAppId/bdAppKey
    appId: isMiniType ? (values.appId || undefined) : undefined,
    originalAppId: isMiniType ? (values.originalAppId || undefined) : undefined,
    bdAppKey: isMiniType ? (values.bdAppKey || undefined) : undefined,
    // H5 才传 h5Url
    h5Url: isH5Type ? (values.h5Url || undefined) : undefined,
    torder: values.torder ?? undefined,
    isEnable: values.isEnable as 1 | 2 | undefined,
    resCode: values.resCode || undefined,
  }

  if (isEdit.value && service) {
    return {
      uniqueCode: service.uniqueCode,
      ...basePayload,
    } as INeighborhoodServiceUpdateDTO
  }

  return basePayload as INeighborhoodServiceAddDTO
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && service) {
    updateMutate(payload as INeighborhoodServiceUpdateDTO, {
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
    createMutate(payload as INeighborhoodServiceAddDTO, {
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
    <!-- 名称 + 跳转类型 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <FormField v-slot="{ componentField }" name="type">
        <FormItem>
          <FormLabel required>
            跳转类型
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择跳转类型" />
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
    </div>

    <!-- 封面 -->
    <FormField name="poster">
      <FormItem>
        <FormLabel>封面</FormLabel>
        <FormControl>
          <div class="flex items-center gap-3">
            <img v-if="formValues.poster" :src="formValues.poster" alt="封面" class="h-16 w-28 rounded border object-cover">
            <div v-else class="flex h-16 w-28 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
              无
            </div>
            <label class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              <span>上传</span>
              <input type="file" accept="image/*" class="sr-only" @change="handleFileUpload">
            </label>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- H5 地址(H5 类型) -->
    <FormField v-if="isH5" v-slot="{ componentField }" name="h5Url">
      <FormItem>
        <FormLabel>H5 地址</FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入 H5 地址" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 小程序字段(小程序类型) -->
    <template v-if="isMiniProgram">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField v-slot="{ componentField }" name="appId">
          <FormItem>
            <FormLabel>微信小程序 APPID</FormLabel>
            <FormControl>
              <Input type="text" placeholder="微信小程序 APPID" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="originalAppId">
          <FormItem>
            <FormLabel>微信原始 appid</FormLabel>
            <FormControl>
              <Input type="text" placeholder="微信原始 appid" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <FormField v-slot="{ componentField }" name="bdAppKey">
        <FormItem>
          <FormLabel>百度小程序 key</FormLabel>
          <FormControl>
            <Input type="text" placeholder="百度小程序 key" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </template>

    <!-- 专题标识(专题类型) -->
    <FormField v-if="isSpecial" v-slot="{ componentField }" name="resCode">
      <FormItem>
        <FormLabel>专题标识</FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入专题标识" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 排序 + 启用状态 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="torder">
        <FormItem>
          <FormLabel>排序</FormLabel>
          <FormControl>
            <Input type="number" placeholder="数值越小越靠前" v-bind="componentField" />
          </FormControl>
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

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
