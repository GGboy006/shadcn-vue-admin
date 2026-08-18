<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import { FormSheetClose, FormSheetFooter, FormSheetHeader, FormSheetTitle } from '@/components/prop-ui/form-sheet'
import { RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useUpload } from '@/composables/use-upload'
import {
  useCreateGoodsMutation,
  useGetCateAllQuery,
  useGetGoodsDetailQuery,
  useUpdateGoodsMutation,
} from '@/services/api/merchant-business.api'
import { optionalInt, optionalNumber, optionalString, showInvalidSubmitToast } from '@/validators/common'

import type { GoodsFormValues } from '../data/schema'

import { buildGoodsPayload, mapGoodsDetailToFormValues } from '../data/payload'

const props = defineProps<{
  context?: {
    goodsCode?: string
  }
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const isEdit = computed(() => !!props.context?.goodsCode)

const { merchantId } = useCurrentMerchantId()

const goodsSchema = z.object({
  name: z.string().min(1, '商品名称不能为空'),
  cateCode: z.string().min(1, '请选择分类'),
  cateName: z.string().min(1, '请选择分类'),
  poster: optionalString,
  detailPoster: optionalString,
  describes: optionalString,
  content: optionalString,
  salePrice: optionalNumber,
  torder: optionalInt,
  isRecommend: z.number().optional(),
  freeFlag: z.number().optional(),
})

const initialValues = reactive<GoodsFormValues>({
  name: '',
  cateCode: '',
  cateName: '',
  poster: undefined,
  detailPoster: undefined,
  describes: undefined,
  content: undefined,
  salePrice: undefined,
  torder: undefined,
  isRecommend: 2,
  freeFlag: 0,
})

const { handleSubmit, setFieldValue, resetForm, values: formValues } = useForm({
  validationSchema: toTypedSchema(goodsSchema),
  initialValues,
})

// 编辑模式:拉详情接口取完整数据(列表 VO 缺 cateCode/detailPoster/torder 等字段,无法直接回显)
const goodsCodeRef = computed(() => props.context?.goodsCode)
const { data: detailData } = useGetGoodsDetailQuery(merchantId, goodsCodeRef)
const detail = computed(() => detailData.value?.data)
watch(detail, (d) => {
  if (d) {
    resetForm({ values: mapGoodsDetailToFormValues(d) })
  }
}, { immediate: true })

const { data: cateData } = useGetCateAllQuery(merchantId)
const cateOptions = computed(() => cateData.value?.data ?? [])

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

function handleCateChange(cateCode: string | number | boolean | Record<string, unknown> | unknown) {
  const code = String(cateCode ?? '')
  setFieldValue('cateCode', code)
  const cate = cateOptions.value.find(c => c.uniqueCode === code)
  setFieldValue('cateName', cate?.name ?? '')
}

const { mutate: createMutate, isPending: isCreating } = useCreateGoodsMutation(merchantId)
const { mutate: updateMutate, isPending: isUpdating } = useUpdateGoodsMutation(merchantId)
const isSubmitting = computed(() => isCreating.value || isUpdating.value)

/** 编辑模式详情加载中(此时表单字段尚未回填,避免用户在空表单上操作) */
const editLoading = computed(() => isEdit.value && !detail.value)

const onSubmit = handleSubmit((values) => {
  const payload = buildGoodsPayload(values as GoodsFormValues, props.context?.goodsCode)

  if (isEdit.value && props.context?.goodsCode) {
    updateMutate(payload as never, {
      onSuccess: () => {
        toast.success('更新成功')
        emits('close')
      },
      onError: (err: any) => toast.error(err.message || '更新失败'),
    })
  }
  else {
    createMutate(payload as never, {
      onSuccess: () => {
        toast.success('创建成功')
        emits('close')
      },
      onError: (err: any) => toast.error(err.message || '创建失败'),
    })
  }
}, showInvalidSubmitToast)
</script>

<template>
  <form class="flex h-full flex-col" @submit="onSubmit">
    <FormSheetHeader class="border-b px-4 py-3">
      <FormSheetTitle class="text-base">
        {{ isEdit ? '编辑商品' : '新建商品' }}
      </FormSheetTitle>
    </FormSheetHeader>

    <div class="flex-1 overflow-y-auto space-y-4 p-4">
      <div v-if="editLoading" class="flex items-center justify-center py-20 text-muted-foreground">
        加载中...
      </div>
      <template v-else>
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel required>
              商品名称
            </FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" placeholder="请输入商品名称" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="cateCode">
            <FormItem>
              <FormLabel required>
                分类
              </FormLabel>
              <Select :model-value="formValues.cateCode" @update:model-value="handleCateChange">
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem v-for="c in cateOptions" :key="c.uniqueCode" :value="c.uniqueCode">
                      {{ c.name }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="salePrice">
            <FormItem>
              <FormLabel>价格</FormLabel>
              <FormControl>
                <Input type="number" v-bind="componentField" placeholder="0.00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="poster">
            <FormItem>
              <FormLabel>封面图</FormLabel>
              <FormControl>
                <div class="flex items-center gap-3">
                  <img v-if="formValues.poster" :src="formValues.poster" alt="封面" class="h-10 w-10 rounded object-cover border">
                  <div v-else class="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    无
                  </div>
                  <label class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground">
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
                  <img v-if="formValues.detailPoster" :src="formValues.detailPoster" alt="详情图" class="h-10 w-10 rounded object-cover border">
                  <div v-else class="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    无
                  </div>
                  <label class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground">
                    <span>上传</span>
                    <input type="file" accept="image/*" class="sr-only" @change="(e: Event) => handleFileUpload(e, 'detailPoster')">
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField }" name="describes">
          <FormItem>
            <FormLabel>简介</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" placeholder="一句话简介" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="content">
          <FormItem>
            <FormLabel>内容</FormLabel>
            <FormControl>
              <RichTextEditor
                :model-value="formValues.content ?? ''"
                placeholder="请输入商品详细内容"
                :min-height="200"
                @update:model-value="setFieldValue('content', $event ?? '')"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="grid grid-cols-3 gap-4">
          <FormField v-slot="{ componentField }" name="torder">
            <FormItem>
              <FormLabel>排序</FormLabel>
              <FormControl>
                <Input type="number" v-bind="componentField" placeholder="排序" />
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
                    <SelectItem :value="1">
                      推荐
                    </SelectItem>
                    <SelectItem :value="2">
                      普通
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="freeFlag">
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
                    <SelectItem :value="0">
                      收费
                    </SelectItem>
                    <SelectItem :value="1">
                      免费
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </template>
    </div>

    <FormSheetFooter class="border-t px-4 py-3">
      <FormSheetClose as-child>
        <Button variant="outline" type="button">
          取消
        </Button>
      </FormSheetClose>
      <Button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? '保存中...' : '保存' }}
      </Button>
    </FormSheetFooter>
  </form>
</template>
