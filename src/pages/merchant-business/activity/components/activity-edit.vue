<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import { DateTimePicker } from '@/components/prop-ui/date-picker'
import { FormSheetClose, FormSheetFooter, FormSheetHeader, FormSheetTitle } from '@/components/prop-ui/form-sheet'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useUpload } from '@/composables/use-upload'
import {
  useCreateActivityMutation,
  useUpdateActivityMutation,
} from '@/services/api/merchant-business.api'
import { optionalInt, optionalNumber, showInvalidSubmitToast } from '@/validators/common'

import type { ActivityFormValues } from '../data/schema'

import { buildActivityPayload } from '../data/payload'

const props = defineProps<{
  context?: {
    uniqueCode?: string
    initialValues?: ActivityFormValues
  }
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const isEdit = computed(() => !!props.context?.uniqueCode)

const activitySchema = z.object({
  name: z.string().min(1, '活动名称不能为空'),
  poster: z.string().nullable().optional(),
  detailPoster: z.string().nullable().optional(),
  sponsorName: z.string().nullable().optional(),
  cateCode: z.string().nullable().optional(),
  cateName: z.string().nullable().optional(),
  describes: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  isCharge: z.number().nullable().optional(),
  salePrice: optionalNumber,
  startTime: z.string().min(1, '开始时间不能为空'),
  endTime: z.string().min(1, '结束时间不能为空'),
  torder: optionalInt,
  isRecommend: z.number().nullable().optional(),
  isEnable: z.number().nullable().optional(),
})

const initialValues = reactive<ActivityFormValues>({
  name: props.context?.initialValues?.name ?? '',
  poster: props.context?.initialValues?.poster,
  detailPoster: props.context?.initialValues?.detailPoster,
  sponsorName: props.context?.initialValues?.sponsorName,
  cateCode: props.context?.initialValues?.cateCode,
  cateName: props.context?.initialValues?.cateName,
  describes: props.context?.initialValues?.describes,
  content: props.context?.initialValues?.content,
  address: props.context?.initialValues?.address,
  isCharge: props.context?.initialValues?.isCharge ?? 2,
  salePrice: props.context?.initialValues?.salePrice,
  startTime: props.context?.initialValues?.startTime ?? '',
  endTime: props.context?.initialValues?.endTime ?? '',
  torder: props.context?.initialValues?.torder,
  isRecommend: props.context?.initialValues?.isRecommend ?? 2,
  isEnable: props.context?.initialValues?.isEnable ?? 1,
})

const { handleSubmit, setFieldValue, values: formValues } = useForm({
  validationSchema: toTypedSchema(activitySchema),
  initialValues,
})

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

const { merchantId } = useCurrentMerchantId()
const { mutate: createMutate, isPending: isCreating } = useCreateActivityMutation(merchantId)
const { mutate: updateMutate, isPending: isUpdating } = useUpdateActivityMutation(merchantId)
const isSubmitting = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((values) => {
  try {
    const payload = buildActivityPayload(values as ActivityFormValues, props.context?.uniqueCode)

    if (isEdit.value && props.context?.uniqueCode) {
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
  }
  catch (err: any) {
    toast.error(err.message || '提交失败')
  }
}, showInvalidSubmitToast)
</script>

<template>
  <form class="flex h-full flex-col" @submit="onSubmit">
    <FormSheetHeader class="border-b px-4 py-3">
      <FormSheetTitle class="text-base">
        {{ isEdit ? '编辑活动' : '新建活动' }}
      </FormSheetTitle>
    </FormSheetHeader>

    <div class="flex-1 overflow-y-auto space-y-4 p-4">
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel required>
            活动名称
          </FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" placeholder="请输入活动名称" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

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

        <FormField v-slot="{ componentField }" name="sponsorName">
          <FormItem>
            <FormLabel>主办单位</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" placeholder="主办单位名称" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <FormField v-slot="{ componentField }" name="address">
        <FormItem>
          <FormLabel>活动地址</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" placeholder="活动地址" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectItem :value="1">
                    收费
                  </SelectItem>
                  <SelectItem :value="2">
                    免费
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
              <Input type="number" v-bind="componentField" placeholder="0.00" :disabled="formValues.isCharge === 2" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <FormField v-slot="{ componentField }" name="describes">
        <FormItem>
          <FormLabel>简介</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" placeholder="活动简介" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="content">
        <FormItem>
          <FormLabel>内容</FormLabel>
          <FormControl>
            <Textarea v-bind="componentField" placeholder="活动详细内容" rows="5" />
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
                  <SelectItem :value="1">
                    启用
                  </SelectItem>
                  <SelectItem :value="2">
                    禁用
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
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
