<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { INeighborhoodSpecialArticle, INeighborhoodSpecialArticleAddDTO, INeighborhoodSpecialArticleUpdateDTO } from '@/services/api/neighborhood-special-article.api'

import { RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUpload } from '@/composables/use-upload'
import { useCreateSpecialArticleMutation, useUpdateSpecialArticleMutation } from '@/services/api/neighborhood-special-article.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { SpecialArticleValidator } from '../validators/special-article.validator'

import { specialArticleValidator } from '../validators/special-article.validator'

const { article, specialCode } = defineProps<{
  article?: INeighborhoodSpecialArticle
  /** 新建时由列表页传入(从路由 [specialCode] 取),编辑时从详情取 */
  specialCode?: string
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const articleTypeList = [
  { value: 1, label: '一图' },
  { value: 2, label: '三图' },
] as const

const contentTypeList = [
  { value: 1, label: '文本' },
  { value: 2, label: '链接' },
] as const

const originalList = [
  { value: 1, label: '原创' },
  { value: 2, label: '否' },
] as const

const imageArticleList = [
  { value: 1, label: '图集' },
  { value: 2, label: '否' },
] as const

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!article?.uniqueCode)

const initialValues = reactive<SpecialArticleValidator>({
  uniqueCode: article?.uniqueCode || undefined,
  specialCode: article?.specialCode || specialCode || '',
  title: article?.title || '',
  poster: article?.poster || '',
  posterAppMin: article?.posterAppMin || '',
  articleType: article?.articleType ?? 1,
  articleImg1: article?.articleImg1 || '',
  articleImg2: article?.articleImg2 || '',
  articleImg3: article?.articleImg3 || '',
  describes: article?.describes || '',
  contentType: article?.contentType ?? 1,
  content: article?.content || '',
  original: article?.original || '',
  sourceUrl: article?.sourceUrl || '',
  keywords: article?.keywords || '',
  authorName: article?.authorName || '',
  tOrFOriginal: article?.tOrFOriginal ?? 2,
  isImageArticle: article?.isImageArticle ?? 2,
  imgNum: article?.imgNum ?? undefined,
  mark: article?.mark || '',
  isEnable: article?.isEnable ?? 1,
  torder: article?.torder ?? undefined,
})

const formSchema = toTypedSchema(specialArticleValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const isLink = computed(() => formValues.contentType === 2)
const isThreeImage = computed(() => formValues.articleType === 2)
const isImageArticle = computed(() => formValues.isImageArticle === 1)

const { upload } = useUpload()
async function handleFileUpload(event: Event, field: 'poster' | 'posterAppMin' | 'articleImg1' | 'articleImg2' | 'articleImg3') {
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

const { mutate: createMutate, isPending: isCreating } = useCreateSpecialArticleMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateSpecialArticleMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: SpecialArticleValidator): INeighborhoodSpecialArticleAddDTO | INeighborhoodSpecialArticleUpdateDTO {
  const contentType = values.contentType as 1 | 2 | undefined
  const isLinkType = contentType === 2
  const isThreeImg = values.articleType === 2

  const basePayload = {
    specialCode: values.specialCode || '',
    title: values.title,
    poster: values.poster || undefined,
    posterAppMin: values.posterAppMin || undefined,
    articleType: values.articleType as 1 | 2 | undefined,
    articleImg1: isThreeImg ? (values.articleImg1 || undefined) : undefined,
    articleImg2: isThreeImg ? (values.articleImg2 || undefined) : undefined,
    articleImg3: isThreeImg ? (values.articleImg3 || undefined) : undefined,
    describes: values.describes || undefined,
    contentType,
    content: isLinkType ? undefined : (values.content || undefined),
    original: values.original || undefined,
    sourceUrl: isLinkType ? (values.sourceUrl || undefined) : undefined,
    keywords: values.keywords || undefined,
    authorName: values.authorName || undefined,
    tOrFOriginal: values.tOrFOriginal as 1 | 2 | undefined,
    isImageArticle: values.isImageArticle as 1 | 2 | undefined,
    imgNum: values.imgNum ?? undefined,
    mark: values.mark || undefined,
    isEnable: values.isEnable as 1 | 2 | undefined,
    torder: values.torder ?? undefined,
  }

  if (isEdit.value && article) {
    return {
      uniqueCode: article.uniqueCode,
      ...basePayload,
    } as INeighborhoodSpecialArticleUpdateDTO
  }

  return basePayload as INeighborhoodSpecialArticleAddDTO
}

const onSubmit = handleSubmit((values) => {
  // specialCode 必填校验(新建时从路由取,若缺失则报错)
  if (!values.specialCode) {
    toast.error('专题标识缺失,请从专题列表进入')
    return
  }

  const payload = buildPayload(values)

  if (isEdit.value && article) {
    updateMutate(payload as INeighborhoodSpecialArticleUpdateDTO, {
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
    createMutate(payload as INeighborhoodSpecialArticleAddDTO, {
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
          文章标题
        </FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入文章标题" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 封面 + 小图 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <input type="file" accept="image/*" class="sr-only" @change="(e: Event) => handleFileUpload(e, 'poster')">
              </label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField name="posterAppMin">
        <FormItem>
          <FormLabel>小图</FormLabel>
          <FormControl>
            <div class="flex items-center gap-3">
              <img v-if="formValues.posterAppMin" :src="formValues.posterAppMin" alt="小图" class="h-16 w-16 rounded border object-cover">
              <div v-else class="flex h-16 w-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                无
              </div>
              <label class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                <span>上传</span>
                <input type="file" accept="image/*" class="sr-only" @change="(e: Event) => handleFileUpload(e, 'posterAppMin')">
              </label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 文章类型 + 三图模式图片 -->
    <FormField v-slot="{ componentField }" name="articleType">
      <FormItem>
        <FormLabel>文章类型</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="选择文章类型" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="t in articleTypeList" :key="t.value" :value="t.value">
                {{ t.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>

    <div v-if="isThreeImage" class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <FormField name="articleImg1">
        <FormItem>
          <FormLabel>图片 1</FormLabel>
          <FormControl>
            <div class="flex items-center gap-2">
              <img v-if="formValues.articleImg1" :src="formValues.articleImg1" alt="图1" class="h-14 w-14 rounded border object-cover">
              <div v-else class="flex h-14 w-14 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                无
              </div>
              <label class="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                上传
                <input type="file" accept="image/*" class="sr-only" @change="(e: Event) => handleFileUpload(e, 'articleImg1')">
              </label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField name="articleImg2">
        <FormItem>
          <FormLabel>图片 2</FormLabel>
          <FormControl>
            <div class="flex items-center gap-2">
              <img v-if="formValues.articleImg2" :src="formValues.articleImg2" alt="图2" class="h-14 w-14 rounded border object-cover">
              <div v-else class="flex h-14 w-14 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                无
              </div>
              <label class="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                上传
                <input type="file" accept="image/*" class="sr-only" @change="(e: Event) => handleFileUpload(e, 'articleImg2')">
              </label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField name="articleImg3">
        <FormItem>
          <FormLabel>图片 3</FormLabel>
          <FormControl>
            <div class="flex items-center gap-2">
              <img v-if="formValues.articleImg3" :src="formValues.articleImg3" alt="图3" class="h-14 w-14 rounded border object-cover">
              <div v-else class="flex h-14 w-14 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                无
              </div>
              <label class="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                上传
                <input type="file" accept="image/*" class="sr-only" @change="(e: Event) => handleFileUpload(e, 'articleImg3')">
              </label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

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
        <FormLabel>H5 地址</FormLabel>
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

    <!-- 原创 + 是否图集 + 图集图片数 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <FormField v-slot="{ componentField }" name="tOrFOriginal">
        <FormItem>
          <FormLabel>是否原创</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="o in originalList" :key="o.value" :value="o.value">
                  {{ o.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="isImageArticle">
        <FormItem>
          <FormLabel>是否图集</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="i in imageArticleList" :key="i.value" :value="i.value">
                  {{ i.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-if="isImageArticle" v-slot="{ componentField }" name="imgNum">
        <FormItem>
          <FormLabel>图集图片数</FormLabel>
          <FormControl>
            <Input type="number" placeholder="图片数" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <div v-else />
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

    <!-- 备注 -->
    <FormField v-slot="{ componentField }" name="mark">
      <FormItem>
        <FormLabel>备注</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" placeholder="请输入备注" rows="2" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
