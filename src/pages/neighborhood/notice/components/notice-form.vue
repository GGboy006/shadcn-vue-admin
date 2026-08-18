<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { INeighborhoodNotice, INeighborhoodNoticeAddDTO, INeighborhoodNoticeUpdateDTO } from '@/services/api/neighborhood-notice.api'

import { RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateNoticeMutation, useUpdateNoticeMutation } from '@/services/api/neighborhood-notice.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { NoticeValidator } from '../validators/notice.validator'

import { noticeValidator } from '../validators/notice.validator'

const { notice } = defineProps<{
  notice?: INeighborhoodNotice
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const contentTypeList = [
  { value: 1, label: '文本' },
  { value: 2, label: '链接' },
] as const

const publicStatusList = [
  { value: 1, label: '公有' },
  { value: 2, label: '私有' },
] as const

const isEdit = computed(() => !!notice?.uniqueCode)

const initialValues = reactive<NoticeValidator>({
  uniqueCode: notice?.uniqueCode || undefined,
  title: notice?.title || '',
  introduction: notice?.introduction || '',
  content: notice?.content || '',
  contentType: notice?.contentType ?? 1,
  h5Url: notice?.h5Url || '',
  isPublic: notice?.isPublic ?? 1,
  torder: notice?.torder ?? undefined,
})

const formSchema = toTypedSchema(noticeValidator)
const { handleSubmit, setFieldValue, values: formValues } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const isLink = computed(() => formValues.contentType === 2)

const { mutate: createMutate, isPending: isCreating } = useCreateNoticeMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateNoticeMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: NoticeValidator): INeighborhoodNoticeAddDTO | INeighborhoodNoticeUpdateDTO {
  const contentType = values.contentType as 1 | 2 | undefined
  const isLinkType = contentType === 2

  const basePayload = {
    title: values.title,
    introduction: values.introduction || undefined,
    contentType,
    content: isLinkType ? undefined : (values.content || undefined),
    h5Url: isLinkType ? (values.h5Url || undefined) : undefined,
    isPublic: values.isPublic as 1 | 2 | undefined,
    torder: values.torder ?? undefined,
  }

  if (isEdit.value && notice) {
    return {
      uniqueCode: notice.uniqueCode,
      ...basePayload,
    } as INeighborhoodNoticeUpdateDTO
  }

  return basePayload as INeighborhoodNoticeAddDTO
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && notice) {
    updateMutate(payload as INeighborhoodNoticeUpdateDTO, {
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
    createMutate(payload as INeighborhoodNoticeAddDTO, {
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

    <!-- 简介 -->
    <FormField v-slot="{ componentField }" name="introduction">
      <FormItem>
        <FormLabel>简介</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" placeholder="请输入公告简介" rows="2" />
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
            <SelectItem v-for="t in contentTypeList" :key="t.value" :value="t.value">
              {{ t.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 正文(文本类型) -->
    <FormField v-if="!isLink" name="content">
      <FormItem>
        <FormLabel>正文</FormLabel>
        <FormControl>
          <RichTextEditor
            :model-value="formValues.content ?? ''"
            placeholder="请输入正文内容"
            :min-height="240"
            @update:model-value="setFieldValue('content', $event ?? '')"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 跳转链接(链接类型) -->
    <FormField v-if="isLink" v-slot="{ componentField }" name="h5Url">
      <FormItem>
        <FormLabel>跳转链接</FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入跳转链接" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 是否公有 与 排序 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      <FormField v-slot="{ componentField }" name="isPublic">
        <FormItem>
          <FormLabel>是否公有</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="s in publicStatusList" :key="s.value" :value="s.value">
                {{ s.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="torder">
        <FormItem>
          <FormLabel>排序</FormLabel>
          <FormControl>
            <Input type="number" placeholder="数值越小越靠前" v-bind="componentField" />
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
