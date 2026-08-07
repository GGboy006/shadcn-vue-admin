<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { ICommunityColumn, ICommunityColumnAddDTO, ICommunityColumnUpdateDTO } from '@/services/api/community-column.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpload } from '@/composables/use-upload'
import { useCreateColumnMutation, useUpdateColumnMutation } from '@/services/api/community-column.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { CommunityColumnValidator } from '../validators/column.validator'

import { communityColumnValidator } from '../validators/column.validator'

const { column } = defineProps<{
  column?: ICommunityColumn
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

// 栏目类型选项(对接文档 14 节 · 小区栏目 type)
const typeList = [
  { value: 1, label: '社区公告' },
  { value: 2, label: '办事指南' },
  { value: 3, label: 'AI客服' },
  { value: 4, label: '社区周边' },
  { value: 5, label: '读书会' },
  { value: 6, label: '百度小程序' },
  { value: 7, label: '微信小程序' },
  { value: 8, label: '社区动态' },
  { value: 57, label: '居委会' },
  { value: 84, label: 'AI百事通' },
  { value: 87, label: '社区动态详情' },
  { value: 88, label: '社区分栏' },
  { value: 89, label: '全民阅读' },
] as const

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!column?.uniqueCode)

const initialValues = reactive<CommunityColumnValidator>({
  uniqueCode: column?.uniqueCode || undefined,
  name: column?.name || '',
  logo: column?.logo || '',
  type: column?.type ?? undefined,
  torder: column?.torder ?? undefined,
  isEnable: column?.isEnable ?? 1,
  appId: column?.appId || '',
  readingCode: column?.readingCode || '',
  h5Url: column?.h5Url || '',
  resCode: column?.resCode || '',
})

const formSchema = toTypedSchema(communityColumnValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const { upload } = useUpload()
async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return
  try {
    const url = await upload(file)
    setFieldValue('logo', url)
  }
  catch {
    // error handled by useUpload
  }
  finally {
    target.value = ''
  }
}

const { mutate: createMutate, isPending: isCreating } = useCreateColumnMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateColumnMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: CommunityColumnValidator): ICommunityColumnAddDTO | ICommunityColumnUpdateDTO {
  const basePayload = {
    name: values.name,
    logo: values.logo || undefined,
    type: values.type as ICommunityColumnAddDTO['type'],
    torder: values.torder ?? undefined,
    isEnable: values.isEnable as 1 | 2 | undefined,
    appId: values.appId || undefined,
    readingCode: values.readingCode || undefined,
    h5Url: values.h5Url || undefined,
    resCode: values.resCode || undefined,
  }

  if (isEdit.value && column) {
    return {
      uniqueCode: column.uniqueCode,
      ...basePayload,
    } as ICommunityColumnUpdateDTO
  }

  return basePayload as ICommunityColumnAddDTO
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && column) {
    updateMutate(payload as ICommunityColumnUpdateDTO, {
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
    createMutate(payload as ICommunityColumnAddDTO, {
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
    <!-- 名称 -->
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel required>
          栏目名称
        </FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入栏目名称" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 栏目类型 -->
    <FormField v-slot="{ componentField }" name="type">
      <FormItem>
        <FormLabel>栏目类型</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="选择栏目类型" />
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

    <!-- Logo -->
    <FormField name="logo">
      <FormItem>
        <FormLabel>Logo</FormLabel>
        <FormControl>
          <div class="flex items-center gap-3">
            <img v-if="formValues.logo" :src="formValues.logo" alt="Logo" class="size-16 rounded border object-cover">
            <div v-else class="flex size-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
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

    <!-- 小程序 appId / 阅览室编码 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="appId">
        <FormItem>
          <FormLabel>小程序 appId</FormLabel>
          <FormControl>
            <Input type="text" placeholder="小程序应用ID" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="readingCode">
        <FormItem>
          <FormLabel>阅览室编码</FormLabel>
          <FormControl>
            <Input type="text" placeholder="阅览室编码" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- H5 地址 / 跳转标识 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="h5Url">
        <FormItem>
          <FormLabel>H5 地址</FormLabel>
          <FormControl>
            <Input type="text" placeholder="H5 跳转地址" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="resCode">
        <FormItem>
          <FormLabel>跳转标识</FormLabel>
          <FormControl>
            <Input type="text" placeholder="其他标识 / 跳转编码" v-bind="componentField" />
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
