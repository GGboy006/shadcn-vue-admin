<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { INeighborhoodUnified, INeighborhoodUnifiedAddDTO, INeighborhoodUnifiedUpdateDTO } from '@/services/api/neighborhood-unified.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpload } from '@/composables/use-upload'
import { useCreateUnifiedMutation, useUpdateUnifiedMutation } from '@/services/api/neighborhood-unified.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { UnifiedValidator } from '../validators/unified.validator'

import { unifiedValidator } from '../validators/unified.validator'

const { unified } = defineProps<{
  unified?: INeighborhoodUnified
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

// 栏目类型选项(附录 B.3)
const typeList = [
  { value: 7, label: 'H5' },
  { value: 29, label: '企业文章' },
  { value: 31, label: '企业简介' },
  { value: 32, label: '联系我们' },
  { value: 35, label: '加入企业' },
  { value: 36, label: '企业招聘' },
  { value: 37, label: '在线留言' },
  { value: 38, label: '视频课程' },
  { value: 41, label: '企业认证' },
  { value: 42, label: '企业文章详情' },
  { value: 61, label: '社区服务热线' },
] as const

const positionList = [
  { value: 1, label: '上部' },
  { value: 2, label: '中部' },
  { value: 3, label: '底部' },
] as const

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!unified?.uniqueCode)

const initialValues = reactive<UnifiedValidator>({
  uniqueCode: unified?.uniqueCode || undefined,
  name: unified?.name || '',
  type: unified?.type ?? 7,
  poster: unified?.poster || '',
  torder: unified?.torder ?? undefined,
  position: unified?.position ?? 1,
  isEnable: unified?.isEnable ?? 1,
  resCode: unified?.resCode || '',
})

const formSchema = toTypedSchema(unifiedValidator)
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
    setFieldValue('poster', url)
  }
  catch {
    // error handled by useUpload
  }
  finally {
    target.value = ''
  }
}

const { mutate: createMutate, isPending: isCreating } = useCreateUnifiedMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateUnifiedMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: UnifiedValidator): INeighborhoodUnifiedAddDTO | INeighborhoodUnifiedUpdateDTO {
  const basePayload = {
    name: values.name,
    type: values.type as INeighborhoodUnifiedAddDTO['type'],
    poster: values.poster || undefined,
    torder: values.torder ?? undefined,
    position: values.position as 1 | 2 | 3 | undefined,
    isEnable: values.isEnable as 1 | 2 | undefined,
    resCode: values.resCode || undefined,
  }

  if (isEdit.value && unified) {
    return {
      uniqueCode: unified.uniqueCode,
      ...basePayload,
    } as INeighborhoodUnifiedUpdateDTO
  }

  return basePayload as INeighborhoodUnifiedAddDTO
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && unified) {
    updateMutate(payload as INeighborhoodUnifiedUpdateDTO, {
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
    createMutate(payload as INeighborhoodUnifiedAddDTO, {
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

    <!-- 类型 + 位置 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="type">
        <FormItem>
          <FormLabel required>
            栏目类型
          </FormLabel>
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

      <FormField v-slot="{ componentField }" name="position">
        <FormItem>
          <FormLabel>位置</FormLabel>
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

    <!-- 跳转标识 -->
    <FormField v-slot="{ componentField }" name="resCode">
      <FormItem>
        <FormLabel>跳转标识</FormLabel>
        <FormControl>
          <Input type="text" placeholder="其他标识 / H5 地址" v-bind="componentField" />
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
