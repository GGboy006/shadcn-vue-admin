<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { IHousekeeperCategory, IHousekeeperCategorySaveDTO } from '@/services/api/housekeeper.api'

import ImageUpload from '@/components/image-upload/image-upload.vue'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateHousekeeperCategoryMutation, useUpdateHousekeeperCategoryMutation } from '@/services/api/housekeeper.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { HousekeeperCategoryValidator } from '../../validators/category.validator'

import { housekeeperCategoryValidator } from '../../validators/category.validator'

const { category } = defineProps<{
  category?: IHousekeeperCategory
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const enableStatusList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!category?.categoryId)

const initialValues = reactive<HousekeeperCategoryValidator>({
  categoryId: category?.categoryId || undefined,
  categoryName: category?.categoryName || '',
  categoryCode: category?.categoryCode || undefined,
  icon: category?.icon || undefined,
  description: category?.description || undefined,
  sortOrder: category?.sortOrder ?? undefined,
  status: category?.status ?? 1,
})

const formSchema = toTypedSchema(housekeeperCategoryValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const { mutate: createMutate, isPending: isCreating } = useCreateHousekeeperCategoryMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateHousekeeperCategoryMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: HousekeeperCategoryValidator): IHousekeeperCategorySaveDTO {
  return {
    categoryId: isEdit.value ? category?.categoryId : undefined,
    categoryName: values.categoryName,
    categoryCode: values.categoryCode || undefined,
    icon: values.icon || undefined,
    description: values.description || undefined,
    sortOrder: values.sortOrder ?? undefined,
    status: values.status as 1 | 2 | undefined,
  }
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && category) {
    updateMutate(payload, {
      onSuccess: () => {
        toast.success('更新成功')
        emits('close')
      },
      onError: (err: any) => toast.error(err.message || '更新失败'),
    })
  }
  else {
    createMutate(payload, {
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
  <div class="space-y-6">
    <form class="space-y-6" @submit="onSubmit">
      <!-- 分类名称 -->
      <FormField v-slot="{ componentField }" name="categoryName">
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

      <!-- 分类编码 -->
      <FormField v-slot="{ componentField }" name="categoryCode">
        <FormItem>
          <FormLabel>分类编码</FormLabel>
          <FormControl>
            <Input type="text" placeholder="分类编码(选填)" v-bind="componentField" />
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

      <!-- 描述 -->
      <FormField v-slot="{ componentField }" name="description">
        <FormItem>
          <FormLabel>描述</FormLabel>
          <FormControl>
            <Textarea v-bind="componentField" placeholder="请输入分类描述" rows="2" />
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
