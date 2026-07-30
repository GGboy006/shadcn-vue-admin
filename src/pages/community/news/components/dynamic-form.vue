<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { ICommunityDynamic, ICommunityDynamicAddDTO, ICommunityDynamicUpdateDTO } from '@/services/api/community-dynamic.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUpload } from '@/composables/use-upload'
import { useCreateDynamicMutation, useUpdateDynamicMutation } from '@/services/api/community-dynamic.api'

import type { DynamicValidator } from '../validators/dynamic.validator'

import { dynamicValidator } from '../validators/dynamic.validator'

const { dynamic } = defineProps<{
  dynamic?: ICommunityDynamic
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const enableStatusList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!dynamic?.uniqueCode)

const { upload } = useUpload()

const initialValues = reactive<DynamicValidator>({
  uniqueCode: dynamic?.uniqueCode || undefined,
  title: dynamic?.title || '',
  poster: dynamic?.poster || '',
  describes: dynamic?.describes || '',
  content: dynamic?.content || '',
  original: dynamic?.original || '',
  keywords: dynamic?.keywords || '',
  userName: dynamic?.userName || '',
  userPoster: dynamic?.userPoster || '',
  sourceUrl: dynamic?.sourceUrl || '',
  isEnable: dynamic?.isEnable ?? 1,
})

const formSchema = toTypedSchema(dynamicValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

async function handleFileUpload(event: Event, field: 'poster' | 'userPoster') {
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

const { mutate: createMutate, isPending: isCreating } = useCreateDynamicMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateDynamicMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: DynamicValidator): ICommunityDynamicAddDTO | ICommunityDynamicUpdateDTO {
  const basePayload = {
    title: values.title,
    poster: values.poster || undefined,
    describes: values.describes || undefined,
    content: values.content || undefined,
    original: values.original || undefined,
    keywords: values.keywords || undefined,
    userName: values.userName || undefined,
    userPoster: values.userPoster || undefined,
    sourceUrl: values.sourceUrl || undefined,
    isEnable: values.isEnable as 1 | 2 | undefined,
  }

  if (isEdit.value && dynamic) {
    return {
      uniqueCode: dynamic.uniqueCode,
      ...basePayload,
    } as ICommunityDynamicUpdateDTO
  }

  return basePayload as ICommunityDynamicAddDTO
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && dynamic) {
    updateMutate(payload as ICommunityDynamicUpdateDTO, {
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
    createMutate(payload as ICommunityDynamicAddDTO, {
      onSuccess: () => {
        toast.success('创建成功')
        emits('close')
      },
      onError: (err: any) => {
        toast.error(err.message || '创建失败')
      },
    })
  }
})
</script>

<template>
  <div class="max-h-[600px] overflow-y-auto">
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
              <img
                v-if="formValues.poster"
                :src="formValues.poster"
                alt="封面"
                class="h-16 w-24 rounded object-cover border"
              >
              <div
                v-else
                class="h-16 w-24 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground"
              >
                无
              </div>
              <label
                class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground"
              >
                <span>上传</span>
                <input
                  type="file"
                  accept="image/*"
                  class="sr-only"
                  @change="(e: Event) => handleFileUpload(e, 'poster')"
                >
              </label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 介绍 -->
      <FormField v-slot="{ componentField }" name="describes">
        <FormItem>
          <FormLabel>介绍</FormLabel>
          <FormControl>
            <Textarea v-bind="componentField" placeholder="请输入文章介绍" rows="2" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 正文 -->
      <FormField v-slot="{ componentField }" name="content">
        <FormItem>
          <FormLabel>正文</FormLabel>
          <FormControl>
            <Textarea v-bind="componentField" placeholder="请输入正文内容" rows="6" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 来源与作者 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField v-slot="{ componentField }" name="original">
          <FormItem>
            <FormLabel>来源</FormLabel>
            <FormControl>
              <Input type="text" placeholder="请输入来源" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="userName">
          <FormItem>
            <FormLabel>作者名称</FormLabel>
            <FormControl>
              <Input type="text" placeholder="请输入作者名称" v-bind="componentField" />
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

      <!-- 来源网址 -->
      <FormField v-slot="{ componentField }" name="sourceUrl">
        <FormItem>
          <FormLabel>来源网址</FormLabel>
          <FormControl>
            <Input type="text" placeholder="请输入文章来源网址" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 状态 -->
      <FormField v-slot="{ componentField }" name="isEnable">
        <FormItem>
          <FormLabel>状态</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择状态" />
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

      <Button type="submit" class="w-full" :disabled="isSubmitting">
        {{ isSubmitting ? '保存中...' : '保存' }}
      </Button>
    </form>
  </div>
</template>
