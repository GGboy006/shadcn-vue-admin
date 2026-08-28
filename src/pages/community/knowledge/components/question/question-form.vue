<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { IKnowledgeQuestion, IKnowledgeQuestionSaveDTO } from '@/services/api/knowledge.api'

import ImageUpload from '@/components/image-upload/image-upload.vue'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateKnowledgeQuestionMutation, useUpdateKnowledgeQuestionMutation } from '@/services/api/knowledge.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { QuestionValidator } from '../../validators/question.validator'

import { questionValidator } from '../../validators/question.validator'

const { question } = defineProps<{
  question?: IKnowledgeQuestion
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const enableStatusList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!question?.questionId)

const initialValues = reactive<QuestionValidator>({
  questionId: question?.questionId || undefined,
  questionName: question?.questionName || '',
  keyword: question?.keyword || '',
  prompt: question?.prompt || '',
  icon: question?.icon || undefined,
  sortOrder: question?.sortOrder ?? undefined,
  status: question?.status ?? 1,
})

const formSchema = toTypedSchema(questionValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const { mutate: createMutate, isPending: isCreating } = useCreateKnowledgeQuestionMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateKnowledgeQuestionMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: QuestionValidator): IKnowledgeQuestionSaveDTO {
  return {
    questionId: isEdit.value ? question?.questionId : undefined,
    questionName: values.questionName,
    keyword: values.keyword,
    prompt: values.prompt,
    icon: values.icon || undefined,
    sortOrder: values.sortOrder ?? undefined,
    status: values.status as 1 | 2 | undefined,
  }
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && question) {
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
  <div class="space-y-6">
    <form class="space-y-6" @submit="onSubmit">
      <!-- 问答名称 -->
      <FormField v-slot="{ componentField }" name="questionName">
        <FormItem>
          <FormLabel required>
            问答名称
          </FormLabel>
          <FormControl>
            <Input type="text" placeholder="请输入问答名称" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 关键词 -->
      <FormField v-slot="{ componentField }" name="keyword">
        <FormItem>
          <FormLabel required>
            关键词
          </FormLabel>
          <FormControl>
            <Input type="text" placeholder="触发该问答的关键词" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 提示词 -->
      <FormField v-slot="{ componentField }" name="prompt">
        <FormItem>
          <FormLabel required>
            提示词
          </FormLabel>
          <FormControl>
            <Textarea v-bind="componentField" placeholder="请输入提示词内容" rows="4" />
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

      <!-- 排序 与 状态 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
