<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { ICommunityMemberPrice, ICommunityMemberPriceAddDTO, ICommunityMemberPriceUpdateDTO } from '@/services/api/community-member-price.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateMemberPriceMutation, useUpdateMemberPriceMutation } from '@/services/api/community-member-price.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { CommunityMemberPriceValidator } from '../validators/member-price.validator'

import { buildMemberPricePayload } from '../data/payload'
import { communityMemberPriceValidator } from '../validators/member-price.validator'

const { price } = defineProps<{
  price?: ICommunityMemberPrice
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!price?.uniqueCode)

const initialValues = reactive<CommunityMemberPriceValidator>({
  uniqueCode: price?.uniqueCode || undefined,
  priceName: price?.priceName || '',
  price: price?.price ?? undefined,
  effectiveDays: price?.effectiveDays ?? undefined,
  remark: price?.remark || '',
  isEnable: price?.isEnable ?? 1,
  sortOrder: price?.sortOrder ?? 0,
})

const formSchema = toTypedSchema(communityMemberPriceValidator)
const { handleSubmit } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const { mutate: createMutate, isPending: isCreating } = useCreateMemberPriceMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateMemberPriceMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((values) => {
  const payload = buildMemberPricePayload(values, isEdit.value ? price?.uniqueCode : undefined)

  if (isEdit.value && price) {
    updateMutate(payload as ICommunityMemberPriceUpdateDTO, {
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
    createMutate(payload as ICommunityMemberPriceAddDTO, {
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
    <FormField v-slot="{ componentField }" name="priceName">
      <FormItem>
        <FormLabel required>
          套餐名称
        </FormLabel>
        <FormControl>
          <Input type="text" placeholder="如月卡 / 季卡 / 年卡" maxlength="100" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="price">
        <FormItem>
          <FormLabel required>
            售价(元)
          </FormLabel>
          <FormControl>
            <Input type="number" min="0" step="0.01" placeholder="可为 0" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="effectiveDays">
        <FormItem>
          <FormLabel required>
            有效天数
          </FormLabel>
          <FormControl>
            <Input type="number" min="1" step="1" placeholder="如 365" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="sortOrder">
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

    <FormField v-slot="{ componentField }" name="remark">
      <FormItem>
        <FormLabel>备注</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" placeholder="选填" rows="2" maxlength="500" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
