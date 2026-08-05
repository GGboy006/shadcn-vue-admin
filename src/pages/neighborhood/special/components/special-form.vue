<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { INeighborhoodSpecial, INeighborhoodSpecialAddDTO, INeighborhoodSpecialUpdateDTO } from '@/services/api/neighborhood-special.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUpload } from '@/composables/use-upload'
import { useCreateSpecialMutation, useUpdateSpecialMutation } from '@/services/api/neighborhood-special.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { SpecialValidator } from '../validators/special.validator'

import { specialValidator } from '../validators/special.validator'

const { special } = defineProps<{
  special?: INeighborhoodSpecial
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!special?.uniqueCode)

const initialValues = reactive<SpecialValidator>({
  uniqueCode: special?.uniqueCode || undefined,
  name: special?.name || '',
  poster: special?.poster || '',
  mark: special?.mark || '',
  isEnable: special?.isEnable ?? 1,
  torder: special?.torder ?? undefined,
})

const formSchema = toTypedSchema(specialValidator)
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

const { mutate: createMutate, isPending: isCreating } = useCreateSpecialMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateSpecialMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: SpecialValidator): INeighborhoodSpecialAddDTO | INeighborhoodSpecialUpdateDTO {
  const basePayload = {
    name: values.name,
    poster: values.poster || undefined,
    mark: values.mark || undefined,
    isEnable: values.isEnable as 1 | 2 | undefined,
    torder: values.torder ?? undefined,
  }

  if (isEdit.value && special) {
    return {
      uniqueCode: special.uniqueCode,
      ...basePayload,
    } as INeighborhoodSpecialUpdateDTO
  }

  return basePayload as INeighborhoodSpecialAddDTO
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && special) {
    updateMutate(payload as INeighborhoodSpecialUpdateDTO, {
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
    createMutate(payload as INeighborhoodSpecialAddDTO, {
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
    <!-- 专题名称 -->
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel required>
          专题名称
        </FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入专题名称" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 封面 -->
    <FormField name="poster">
      <FormItem>
        <FormLabel>封面图</FormLabel>
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

    <!-- 备注 -->
    <FormField v-slot="{ componentField }" name="mark">
      <FormItem>
        <FormLabel>备注</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" placeholder="请输入备注" rows="3" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
