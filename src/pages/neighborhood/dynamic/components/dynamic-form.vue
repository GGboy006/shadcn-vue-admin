<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { INeighborhoodDynamic, INeighborhoodDynamicAddDTO, INeighborhoodDynamicUpdateDTO } from '@/services/api/neighborhood-dynamic.api'

import { RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUpload } from '@/composables/use-upload'
import { useCreateDynamicMutation, useUpdateDynamicMutation } from '@/services/api/neighborhood-dynamic.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { DynamicValidator } from '../validators/dynamic.validator'

import { dynamicValidator } from '../validators/dynamic.validator'

const { dynamic } = defineProps<{
  dynamic?: INeighborhoodDynamic
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const contentTypeList = [
  { value: 1, label: '文本' },
  { value: 2, label: '链接' },
] as const

const auditStatusList = [
  { value: 0, label: '待审核' },
  { value: 1, label: '通过' },
  { value: 2, label: '未通过' },
] as const

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!dynamic?.uniqueCode)

const initialValues = reactive<DynamicValidator>({
  uniqueCode: dynamic?.uniqueCode || undefined,
  title: dynamic?.title || '',
  poster: dynamic?.poster || '',
  contentType: dynamic?.contentType ?? 1,
  content: dynamic?.content || '',
  describes: dynamic?.describes || '',
  original: dynamic?.original || '',
  sourceUrl: dynamic?.sourceUrl || '',
  keywords: dynamic?.keywords || '',
  authorName: dynamic?.authorName || '',
  status: dynamic?.status ?? 0,
  torder: dynamic?.torder ?? undefined,
  isEnable: dynamic?.isEnable ?? 1,
})

const formSchema = toTypedSchema(dynamicValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const isLink = computed(() => formValues.contentType === 2)

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

const { mutate: createMutate, isPending: isCreating } = useCreateDynamicMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateDynamicMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: DynamicValidator): INeighborhoodDynamicAddDTO | INeighborhoodDynamicUpdateDTO {
  const contentType = values.contentType as 1 | 2 | undefined
  const isLinkType = contentType === 2

  const basePayload = {
    title: values.title,
    poster: values.poster || undefined,
    contentType,
    content: isLinkType ? undefined : (values.content || undefined),
    describes: values.describes || undefined,
    original: values.original || undefined,
    sourceUrl: isLinkType ? (values.sourceUrl || undefined) : undefined,
    keywords: values.keywords || undefined,
    authorName: values.authorName || undefined,
    status: values.status as 0 | 1 | 2 | undefined,
    torder: values.torder ?? undefined,
    isEnable: values.isEnable as 1 | 2 | undefined,
  }

  if (isEdit.value && dynamic) {
    return {
      uniqueCode: dynamic.uniqueCode,
      ...basePayload,
    } as INeighborhoodDynamicUpdateDTO
  }

  return basePayload as INeighborhoodDynamicAddDTO
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && dynamic) {
    updateMutate(payload as INeighborhoodDynamicUpdateDTO, {
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
    createMutate(payload as INeighborhoodDynamicAddDTO, {
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

    <!-- 封面图 -->
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

    <!-- 内容类型 -->
    <FormField v-slot="{ componentField }" name="contentType">
      <FormItem>
        <FormLabel>内容类型</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="请选择内容类型" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="t in contentTypeList" :key="t.value" :value="t.value">
                {{ t.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 正文(文本类型,富文本) -->
    <FormField name="content">
      <FormItem>
        <FormLabel>正文</FormLabel>
        <FormControl>
          <RichTextEditor
            :model-value="formValues.content ?? ''"
            placeholder="请输入正文内容"
            :min-height="200"
            @update:model-value="setFieldValue('content', $event ?? '')"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 来源链接(链接类型) -->
    <FormField v-if="isLink" v-slot="{ componentField }" name="sourceUrl">
      <FormItem>
        <FormLabel>来源链接</FormLabel>
        <FormControl>
          <Input type="text" placeholder="H5 地址" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 来源 + 作者 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="original">
        <FormItem>
          <FormLabel>来源</FormLabel>
          <FormControl>
            <Input type="text" placeholder="来源名称" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="authorName">
        <FormItem>
          <FormLabel>作者</FormLabel>
          <FormControl>
            <Input type="text" placeholder="作者名称" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 关键词 -->
    <FormField v-slot="{ componentField }" name="keywords">
      <FormItem>
        <FormLabel>关键词</FormLabel>
        <FormControl>
          <Input type="text" placeholder="多个关键词用英文逗号隔开" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 简介 -->
    <FormField v-slot="{ componentField }" name="describes">
      <FormItem>
        <FormLabel>简介</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" placeholder="请输入简介" rows="2" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 审核状态 + 排序 + 启用状态 -->
    <div class="grid grid-cols-3 gap-4">
      <FormField v-slot="{ componentField }" name="status">
        <FormItem>
          <FormLabel>审核状态</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="s in auditStatusList" :key="s.value" :value="s.value">
                  {{ s.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="torder">
        <FormItem>
          <FormLabel>排序</FormLabel>
          <FormControl>
            <Input type="number" placeholder="排序" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="isEnable">
        <FormItem>
          <FormLabel>状态</FormLabel>
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
