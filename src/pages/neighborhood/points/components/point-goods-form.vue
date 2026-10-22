<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { PointGoods, PointGoodsSave } from '@/services/api/neighborhood-resident.api'

import ImageUpload from '@/components/image-upload/image-upload.vue'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreatePointGoodsMutation, useUpdatePointGoodsMutation } from '@/services/api/neighborhood-resident.api'
import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ row?: PointGoods }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.goodsId)

const statusOptions = [
  { value: 1, label: '上架' },
  { value: 2, label: '下架' },
] as const

const schema = z.object({
  name: z.string().trim().min(1, '请填写名称'),
  points: optionalInt.refine((value): value is number => typeof value === 'number' && value >= 0, '请填写不小于 0 的整数'),
  stock: optionalInt.refine(value => value === undefined || value >= 0, '请填写不小于 0 的整数'),
  status: optionalNumber,
  sortOrder: optionalInt.refine(value => value === undefined || value >= 0, '请填写不小于 0 的整数'),
  poster: optionalString,
})

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.row?.name ?? '',
    points: props.row?.points ?? undefined,
    stock: props.row?.stock ?? undefined,
    status: props.row?.status ?? 1,
    sortOrder: props.row?.sortOrder ?? undefined,
    poster: props.row?.poster ?? '',
  },
})

const { mutate: createRow, isPending: isCreating } = useCreatePointGoodsMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdatePointGoodsMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: PointGoodsSave = {
    goodsId: isEdit.value ? props.row?.goodsId : undefined,
    name: form.name.trim(),
    points: form.points,
    stock: form.stock,
    status: form.status === 1 || form.status === 2 ? form.status : 1,
    sortOrder: form.sortOrder,
    poster: form.poster?.trim() || undefined,
  }
  const mutate = isEdit.value ? updateRow : createRow
  mutate(payload, {
    onSuccess: () => {
      toast.success(isEdit.value ? '已更新' : '已新增')
      emit('close')
    },
    onError: (err: Error) => toast.error(err.message || '保存失败'),
  })
}, (ctx) => {
  const message = Object.values(ctx.errors)[0]
  if (message)
    toast.error(String(message))
})
</script>

<template>
  <form class="space-y-4" @submit="onSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel required>
            名称
          </FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="points">
        <FormItem>
          <FormLabel required>
            所需积分
          </FormLabel>
          <FormControl><Input type="number" min="0" step="1" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="stock">
        <FormItem>
          <FormLabel>库存</FormLabel>
          <FormControl><Input type="number" min="0" step="1" v-bind="componentField" /></FormControl>
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
              <SelectItem v-for="item in statusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="sortOrder">
        <FormItem>
          <FormLabel>排序</FormLabel>
          <FormControl><Input type="number" min="0" step="1" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
    <FormField name="poster">
      <FormItem>
        <FormLabel>图片</FormLabel>
        <FormControl>
          <ImageUpload
            :model-value="values.poster"
            alt="图片"
            @update:model-value="setFieldValue('poster', $event || undefined)"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
