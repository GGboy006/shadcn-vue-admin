<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { ICommunityMemberPackage, ICommunityMemberPackageAddDTO, ICommunityMemberPackageUpdateDTO } from '@/services/api/community-member-price.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateMemberPackageMutation, useUpdateMemberPackageMutation } from '@/services/api/community-member-price.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { CommunityMemberPriceValidator } from '../validators/member-price.validator'

import { buildMemberPricePayload } from '../data/payload'
import { communityMemberPriceValidator } from '../validators/member-price.validator'

const { pkg } = defineProps<{
  pkg?: ICommunityMemberPackage
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const statusList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!pkg?.packageId)

const initialValues = reactive<CommunityMemberPriceValidator>({
  packageId: pkg?.packageId || undefined,
  packageName: pkg?.packageName || '',
  price: pkg?.price ?? undefined,
  effectiveDays: pkg?.effectiveDays ?? undefined,
  iosProductId: pkg?.iosProductId || '',
  remark: pkg?.remark || '',
  status: pkg?.status ?? 1,
  sort: pkg?.sort ?? 0,
})

const formSchema = toTypedSchema(communityMemberPriceValidator)
const { handleSubmit } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const { mutate: createMutate, isPending: isCreating } = useCreateMemberPackageMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateMemberPackageMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((values) => {
  const payload = buildMemberPricePayload(values, isEdit.value ? pkg?.packageId : undefined)

  if (isEdit.value && pkg) {
    updateMutate(payload as ICommunityMemberPackageUpdateDTO, {
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
    createMutate(payload as ICommunityMemberPackageAddDTO, {
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
    <FormField v-slot="{ componentField }" name="packageName">
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

    <FormField v-slot="{ componentField }" name="iosProductId">
      <FormItem>
        <FormLabel>iOS 商品 ID</FormLabel>
        <FormControl>
          <Input type="text" placeholder="选填,用于 iOS 内购" maxlength="100" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="sort">
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
          <FormLabel>启用状态</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="s in statusList" :key="s.value" :value="s.value">
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
