<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { INeighborhoodBanner, INeighborhoodBannerAddDTO, INeighborhoodBannerUpdateDTO } from '@/services/api/neighborhood-banner.api'

import { DateTimePicker } from '@/components/prop-ui/date-picker'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpload } from '@/composables/use-upload'
import { useCreateBannerMutation, useUpdateBannerMutation } from '@/services/api/neighborhood-banner.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { BannerValidator } from '../validators/banner.validator'

import { bannerValidator } from '../validators/banner.validator'

const { banner } = defineProps<{
  banner?: INeighborhoodBanner
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const positionList = [
  { value: 1, label: '上部' },
  { value: 2, label: '中部' },
  { value: 3, label: '底部' },
] as const

const typeList = [
  { value: 7, label: 'H5' },
  { value: 8, label: '专题' },
  { value: 11, label: '百度小程序' },
  { value: 27, label: '小程序' },
] as const

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!banner?.uniqueCode)

const initialValues = reactive<BannerValidator>({
  uniqueCode: banner?.uniqueCode || undefined,
  position: banner?.position ?? 1,
  name: banner?.name || '',
  poster: banner?.poster || '',
  type: banner?.type ?? 7,
  resCode: banner?.resCode || '',
  startTime: banner?.startTime || '',
  endTime: banner?.endTime || '',
  torder: banner?.torder ?? undefined,
  isEnable: banner?.isEnable ?? 1,
})

const formSchema = toTypedSchema(bannerValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

// resCode 提示随跳转类型变化
const resCodePlaceholder = computed(() => {
  switch (formValues.type) {
    case 7: return 'H5 地址'
    case 8: return '专题标识'
    case 11: return '百度小程序地址'
    case 27: return '小程序地址'
    default: return '跳转标识 / H5 地址'
  }
})

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

const { mutate: createMutate, isPending: isCreating } = useCreateBannerMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateBannerMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: BannerValidator): INeighborhoodBannerAddDTO | INeighborhoodBannerUpdateDTO {
  const basePayload = {
    position: values.position as 1 | 2 | 3,
    name: values.name,
    poster: values.poster,
    type: values.type as 7 | 8 | 11 | 27,
    resCode: values.resCode || undefined,
    startTime: values.startTime || undefined,
    endTime: values.endTime || undefined,
    torder: values.torder ?? undefined,
    isEnable: values.isEnable as 1 | 2 | undefined,
  }

  if (isEdit.value && banner) {
    return {
      uniqueCode: banner.uniqueCode,
      ...basePayload,
    } as INeighborhoodBannerUpdateDTO
  }

  return basePayload as INeighborhoodBannerAddDTO
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && banner) {
    updateMutate(payload as INeighborhoodBannerUpdateDTO, {
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
    createMutate(payload as INeighborhoodBannerAddDTO, {
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
    <!-- 位置 + 跳转类型 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="position">
        <FormItem>
          <FormLabel required>
            位置
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择位置" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="p in positionList" :key="p.value" :value="p.value">
                  {{ p.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
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

    <!-- 名称 -->
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel required>
          名称
        </FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入广告名称" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 图片 -->
    <FormField name="poster">
      <FormItem>
        <FormLabel required>
          广告图片
        </FormLabel>
        <FormControl>
          <div class="flex items-center gap-3">
            <img v-if="formValues.poster" :src="formValues.poster" alt="广告图" class="h-16 w-28 rounded border object-cover">
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

    <!-- 跳转标识 -->
    <FormField v-slot="{ componentField }" name="resCode">
      <FormItem>
        <FormLabel>跳转标识</FormLabel>
        <FormControl>
          <Input type="text" :placeholder="resCodePlaceholder" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 投放时段 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="startTime">
        <FormItem>
          <FormLabel>投放开始时间</FormLabel>
          <FormControl>
            <DateTimePicker v-bind="componentField" placeholder="选择开始时间" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="endTime">
        <FormItem>
          <FormLabel>投放结束时间</FormLabel>
          <FormControl>
            <DateTimePicker v-bind="componentField" placeholder="选择结束时间" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

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
