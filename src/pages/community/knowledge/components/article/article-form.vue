<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { IKnowledgeArticle, IKnowledgeArticleSaveDTO } from '@/services/api/knowledge.api'

import { RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUpload } from '@/composables/use-upload'
import { useCreateKnowledgeArticleMutation, useGetKnowledgeCategoryListQuery, useUpdateKnowledgeArticleMutation } from '@/services/api/knowledge.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { ArticleValidator } from '../../validators/article.validator'

import { articleValidator } from '../../validators/article.validator'

const { article, lockCategoryId } = defineProps<{
  article?: IKnowledgeArticle
  /** 钻取页传入:锁定分类,不允许切换 */
  lockCategoryId?: number
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const publishStatusList = [
  { value: 0, label: '草稿' },
  { value: 1, label: '已发布' },
  { value: 2, label: '已下架' },
] as const

const topFlagList = [
  { value: 0, label: '否' },
  { value: 1, label: '置顶' },
] as const

const isEdit = computed(() => !!article?.articleId)

// 分类下拉(§3.1 list 接口)
const { data: categoryListData } = useGetKnowledgeCategoryListQuery()
const categoryOptions = computed(() =>
  (categoryListData.value?.data ?? []).map(c => ({ value: c.categoryId, label: c.categoryName })),
)

const initialValues = reactive<ArticleValidator>({
  articleId: article?.articleId || undefined,
  categoryId: lockCategoryId ?? article?.categoryId ?? undefined,
  title: article?.title || '',
  content: article?.content || '',
  summary: article?.summary || undefined,
  coverImage: article?.coverImage || undefined,
  source: article?.source || undefined,
  author: article?.author || undefined,
  topFlag: article?.topFlag ?? 0,
  publishStatus: article?.publishStatus ?? 0,
})

const formSchema = toTypedSchema(articleValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const { mutate: createMutate, isPending: isCreating } = useCreateKnowledgeArticleMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateKnowledgeArticleMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

// 封面上传
const { upload } = useUpload()
async function handleCoverUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return
  try {
    const url = await upload(file)
    setFieldValue('coverImage', url)
  }
  catch {
    // error handled by useUpload
  }
  finally {
    target.value = ''
  }
}

function buildPayload(values: ArticleValidator, categoryId: number): IKnowledgeArticleSaveDTO {
  return {
    articleId: isEdit.value ? article?.articleId : undefined,
    categoryId,
    title: values.title,
    content: values.content,
    summary: values.summary || undefined,
    coverImage: values.coverImage || undefined,
    source: values.source || undefined,
    author: values.author || undefined,
    topFlag: values.topFlag as 0 | 1 | undefined,
    publishStatus: values.publishStatus as 0 | 1 | 2 | undefined,
  }
}

const onSubmit = handleSubmit((values) => {
  // 分类为必填(模板已标 required),但 optionalNumber 允许 undefined,此处显式兜底
  const categoryId = values.categoryId ?? lockCategoryId
  if (categoryId === undefined) {
    toast.error('请选择分类')
    return
  }

  const payload = buildPayload(values, categoryId)

  if (isEdit.value && article) {
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
      <!-- 分类 -->
      <FormField v-slot="{ componentField }" name="categoryId">
        <FormItem>
          <FormLabel required>
            分类
          </FormLabel>
          <Select v-bind="componentField" :disabled="!!lockCategoryId">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择分类" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="c in categoryOptions" :key="c.value" :value="c.value">
                {{ c.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

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

      <!-- 摘要 -->
      <FormField v-slot="{ componentField }" name="summary">
        <FormItem>
          <FormLabel>摘要</FormLabel>
          <FormControl>
            <Textarea v-bind="componentField" placeholder="请输入文章摘要" rows="2" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

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
                <span>上传</span>
                <input type="file" accept="image/*" class="sr-only" @change="handleCoverUpload">
              </label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 正文(富文本) -->
      <FormField name="content">
        <FormItem>
          <FormLabel required>
            正文
          </FormLabel>
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

      <!-- 来源 与 作者 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField v-slot="{ componentField }" name="source">
          <FormItem>
            <FormLabel>来源</FormLabel>
            <FormControl>
              <Input type="text" placeholder="请输入来源" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="author">
          <FormItem>
            <FormLabel>作者</FormLabel>
            <FormControl>
              <Input type="text" placeholder="请输入作者" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- 发布状态 与 置顶 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField v-slot="{ componentField }" name="publishStatus">
          <FormItem>
            <FormLabel>发布状态</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem v-for="s in publishStatusList" :key="s.value" :value="s.value">
                  {{ s.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="topFlag">
          <FormItem>
            <FormLabel>置顶</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem v-for="t in topFlagList" :key="t.value" :value="t.value">
                  {{ t.label }}
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
