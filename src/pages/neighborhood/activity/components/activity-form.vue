<script lang="ts" setup>
import type { AcceptableValue } from 'reka-ui'

import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { INeighborhoodActivity, INeighborhoodActivityAddDTO, INeighborhoodActivityUpdateDTO } from '@/services/api/neighborhood-activity.api'
import type { INeighborhoodCateListQuery } from '@/services/api/neighborhood-cate.api'

import { DateTimePicker } from '@/components/prop-ui/date-picker'
import { RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  useCreateActivityMutation,
  useUpdateActivityMutation,
} from '@/services/api/neighborhood-activity.api'
import { useGetCateListQuery } from '@/services/api/neighborhood-cate.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { ActivityValidator } from '../validators/activity.validator'

import { activityValidator } from '../validators/activity.validator'

const { activity } = defineProps<{
  activity?: INeighborhoodActivity
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const isEdit = computed(() => !!activity?.uniqueCode)

const initialValues = reactive<ActivityValidator>({
  uniqueCode: activity?.uniqueCode || undefined,
  name: activity?.name || '',
  poster: activity?.poster || '',
  detailPoster: activity?.detailPoster || '',
  sponsorName: activity?.sponsorName || '',
  cateCode: activity?.cateCode || '',
  cateName: activity?.cateName || '',
  describes: activity?.describes || '',
  content: activity?.content || '',
  address: activity?.address || '',
  isCharge: activity?.isCharge ?? 2,
  salePrice: activity?.salePrice ?? undefined,
  startTime: activity?.startTime || '',
  endTime: activity?.endTime || '',
  status: activity?.status ?? undefined,
  torder: activity?.torder ?? undefined,
  isRecommend: activity?.isRecommend ?? 2,
  isEnable: activity?.isEnable ?? 1,
})

const formSchema = toTypedSchema(activityValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

// 活动分类下拉:用 /cate/page 拉启用的分类(/cate/all 后端只返回启用,但为了和分类管理一致也用 page 接口)
const cateQuery = ref<INeighborhoodCateListQuery>({
  pageNum: 1,
  pageSize: 99,
})
const { data: cateData } = useGetCateListQuery(cateQuery)
const cateOptions = computed(() => cateData.value?.data?.list ?? [])

function handleCateChange(value: AcceptableValue) {
  const code = String(value ?? '')
  const cate = cateOptions.value.find(c => c.uniqueCode === code)
  setFieldValue('cateCode', cate?.uniqueCode || '')
  setFieldValue('cateName', cate?.name || '')
}

const chargeList = [
  { value: 1, label: '收费' },
  { value: 2, label: '免费' },
] as const

const recommendList = [
  { value: 1, label: '推荐' },
  { value: 2, label: '普通' },
] as const

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const { upload } = useUpload()
async function handleFileUpload(event: Event, field: 'poster' | 'detailPoster') {
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

const { mutate: createMutate, isPending: isCreating } = useCreateActivityMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateActivityMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: ActivityValidator): INeighborhoodActivityAddDTO | INeighborhoodActivityUpdateDTO {
  const isCharge = values.isCharge as 1 | 2 | undefined
  const isChargeType = isCharge === 1

  const basePayload = {
    name: values.name,
    poster: values.poster,
    startTime: values.startTime || '',
    endTime: values.endTime || '',
    detailPoster: values.detailPoster || undefined,
    sponsorName: values.sponsorName || undefined,
    cateCode: values.cateCode || undefined,
    cateName: values.cateName || undefined,
    describes: values.describes || undefined,
    content: values.content || undefined,
    address: values.address || undefined,
    isCharge,
    salePrice: isChargeType ? (values.salePrice ?? undefined) : undefined,
    status: values.status as 0 | 1 | 2 | undefined,
    torder: values.torder ?? undefined,
    isRecommend: values.isRecommend as 1 | 2 | undefined,
    isEnable: values.isEnable as 1 | 2 | undefined,
  }

  if (isEdit.value && activity) {
    return {
      uniqueCode: activity.uniqueCode,
      ...basePayload,
    } as INeighborhoodActivityUpdateDTO
  }

  return basePayload as INeighborhoodActivityAddDTO
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && activity) {
    updateMutate(payload as INeighborhoodActivityUpdateDTO, {
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
    createMutate(payload as INeighborhoodActivityAddDTO, {
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
    <!-- 活动名称 -->
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel required>
          活动名称
        </FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入活动名称" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 封面图 + 详情图 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField name="poster">
        <FormItem>
          <FormLabel required>
            封面图
          </FormLabel>
          <FormControl>
            <div class="flex items-center gap-3">
              <img v-if="formValues.poster" :src="formValues.poster" alt="封面" class="h-10 w-10 rounded border object-cover">
              <div v-else class="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
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

      <FormField name="detailPoster">
        <FormItem>
          <FormLabel>详情图</FormLabel>
          <FormControl>
            <div class="flex items-center gap-3">
              <img v-if="formValues.detailPoster" :src="formValues.detailPoster" alt="详情图" class="h-10 w-10 rounded border object-cover">
              <div v-else class="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                无
              </div>
              <label class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                <span>上传</span>
                <input type="file" accept="image/*" class="sr-only" @change="(e: Event) => handleFileUpload(e, 'detailPoster')">
              </label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 主办单位 + 活动分类 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="sponsorName">
        <FormItem>
          <FormLabel>主办单位</FormLabel>
          <FormControl>
            <Input type="text" placeholder="主办单位名称" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="cateCode">
        <FormItem>
          <FormLabel>活动分类</FormLabel>
          <Select v-bind="componentField" @update:model-value="handleCateChange">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择活动分类" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="cate in cateOptions" :key="cate.uniqueCode" :value="cate.uniqueCode">
                  {{ cate.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 活动地址 -->
    <FormField v-slot="{ componentField }" name="address">
      <FormItem>
        <FormLabel>活动地址</FormLabel>
        <FormControl>
          <Input type="text" placeholder="活动地址" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 起止时间 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="startTime">
        <FormItem>
          <FormLabel required>
            开始时间
          </FormLabel>
          <FormControl>
            <DateTimePicker v-bind="componentField" placeholder="选择开始时间" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="endTime">
        <FormItem>
          <FormLabel required>
            结束时间
          </FormLabel>
          <FormControl>
            <DateTimePicker v-bind="componentField" placeholder="选择结束时间" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 收费 + 金额 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="isCharge">
        <FormItem>
          <FormLabel>收费</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="c in chargeList" :key="c.value" :value="c.value">
                  {{ c.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="salePrice">
        <FormItem>
          <FormLabel>金额</FormLabel>
          <FormControl>
            <Input type="number" placeholder="0.00" v-bind="componentField" :disabled="formValues.isCharge === 2" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 简介 -->
    <FormField v-slot="{ componentField }" name="describes">
      <FormItem>
        <FormLabel>简介</FormLabel>
        <FormControl>
          <Input type="text" placeholder="活动简介" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 内容(富文本) -->
    <FormField name="content">
      <FormItem>
        <FormLabel>内容</FormLabel>
        <FormControl>
          <RichTextEditor v-model="formValues.content" placeholder="请输入活动详细内容" :min-height="200" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 排序 + 推荐 + 启用 -->
    <div class="grid grid-cols-3 gap-4">
      <FormField v-slot="{ componentField }" name="torder">
        <FormItem>
          <FormLabel>排序</FormLabel>
          <FormControl>
            <Input type="number" placeholder="排序" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="isRecommend">
        <FormItem>
          <FormLabel>推荐</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="r in recommendList" :key="r.value" :value="r.value">
                  {{ r.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
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
