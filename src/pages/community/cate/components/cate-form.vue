<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { CommunityCateType, ICommunityCate, ICommunityCateAddDTO, ICommunityCateUpdateDTO } from '@/services/api/community-cate.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateCateMutation, useGetCateListQuery, useUpdateCateMutation } from '@/services/api/community-cate.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { CommunityCateValidator } from '../validators/cate.validator'

import { communityCateValidator } from '../validators/cate.validator'

const { cate } = defineProps<{
  cate?: ICommunityCate
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

// 分类类型选项(对接文档 14 节 · 小区分类 type)
const typeList = [
  { value: 1, label: '社区服务' },
  { value: 2, label: '居委会' },
  { value: 3, label: '物业' },
  { value: 4, label: '生活' },
  { value: 5, label: '服务' },
  { value: 9, label: '商品' },
  { value: 10, label: 'AI助手' },
] as const

const tempTypeList = [
  { value: 1, label: '阅览室' },
  { value: 2, label: '居委会服务' },
  { value: 3, label: '常规服务' },
  { value: 4, label: '生活快捷' },
  { value: 5, label: '生活服务' },
  { value: 6, label: '生活商户' },
  { value: 7, label: '服务快捷' },
  { value: 8, label: '便民' },
] as const

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!cate?.uniqueCode)

const initialValues = reactive<CommunityCateValidator>({
  uniqueCode: cate?.uniqueCode || undefined,
  name: cate?.name || '',
  parentCode: cate?.parentCode || '__none__',
  describe: cate?.describe || '',
  torder: cate?.torder ?? undefined,
  type: cate?.type ?? undefined,
  tempType: cate?.tempType ?? undefined,
  isEnable: cate?.isEnable ?? 1,
})

const formSchema = toTypedSchema(communityCateValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

// 选中分类类型后,按 type 拉启用分类作为父级下拉(/community/cate/list?type=)
const cateListQuery = computed(() => ({
  type: formValues.type as CommunityCateType,
}))
const { data: parentCateData } = useGetCateListQuery(cateListQuery)
const parentOptions = computed(() =>
  (parentCateData.value?.data ?? []).filter(item => item.uniqueCode !== cate?.uniqueCode),
)

watch(() => formValues.type, (next, prev) => {
  if (prev === undefined || next === prev)
    return
  setFieldValue('parentCode', '__none__')
})

const { mutate: createMutate, isPending: isCreating } = useCreateCateMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateCateMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: CommunityCateValidator): ICommunityCateAddDTO | ICommunityCateUpdateDTO {
  const basePayload = {
    name: values.name,
    parentCode: !values.parentCode || values.parentCode === '__none__' ? undefined : values.parentCode,
    describe: values.describe || undefined,
    torder: values.torder ?? undefined,
    type: values.type as ICommunityCateAddDTO['type'],
    tempType: values.tempType as ICommunityCateAddDTO['tempType'],
    isEnable: values.isEnable as 1 | 2 | undefined,
  }

  if (isEdit.value && cate) {
    return {
      uniqueCode: cate.uniqueCode,
      ...basePayload,
    } as ICommunityCateUpdateDTO
  }

  return basePayload as ICommunityCateAddDTO
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && cate) {
    updateMutate(payload as ICommunityCateUpdateDTO, {
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
    createMutate(payload as ICommunityCateAddDTO, {
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
    <!-- 名称 -->
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel required>
          分类名称
        </FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入分类名称" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 分类类型 + 父级编码 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="type">
        <FormItem>
          <FormLabel>分类类型</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择分类类型" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="t in typeList" :key="t.value" :value="t.value">
                  {{ t.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="parentCode">
        <FormItem>
          <FormLabel>父级分类</FormLabel>
          <Select v-bind="componentField" :disabled="!formValues.type">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="formValues.type ? '请选择父级分类' : '先选择分类类型'" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="__none__">
                  顶级分类（无父级）
                </SelectItem>
                <SelectItem v-for="item in parentOptions" :key="item.uniqueCode" :value="item.uniqueCode">
                  {{ item.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 描述 -->
    <FormField v-slot="{ componentField }" name="describe">
      <FormItem>
        <FormLabel>描述</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" placeholder="请输入分类描述" rows="2" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 模板类型 + 排序 + 启用状态 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <FormField v-slot="{ componentField }" name="tempType">
        <FormItem>
          <FormLabel>模板类型</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择模板类型" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="t in tempTypeList" :key="t.value" :value="t.value">
                  {{ t.label }}
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

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
