<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { IMerchantAddDTO, IMerchantUpdateDTO } from '@/services/api/merchant.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateMerchantMutation, useUpdateMerchantMutation } from '@/services/api/merchant.api'

import type { Merchant } from '../data/schema'
import type { MerchantValidator } from '../validators/merchant.validator'

import { merchantValidator } from '../validators/merchant.validator'

const { merchant } = defineProps<{
  merchant?: Merchant
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const types = [
  { value: 1, label: '商户' },
  { value: 2, label: '物业' },
] as const

const statusList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!merchant?.merchantId)
const passwordLabel = computed(() => isEdit.value ? '登录密码（留空则不修改）' : '登录密码')

const initialValues = reactive<MerchantValidator>({
  merchantName: merchant?.merchantName || '',
  nickname: merchant?.nickname || merchant?.merchantName || '',
  phone: merchant?.phone || merchant?.contactPhone || '',
  password: '',
  type: merchant?.type || 1,
  contactPhone: merchant?.contactPhone || '',
  status: merchant?.status || 1,
})

const merchantFormSchema = toTypedSchema(merchantValidator)
const { handleSubmit } = useForm({
  validationSchema: merchantFormSchema,
  initialValues,
})

const { mutate: createMutate, isPending: isCreating } = useCreateMerchantMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateMerchantMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((values) => {
  if (isEdit.value && merchant) {
    const payload: IMerchantUpdateDTO = {
      merchantId: merchant.merchantId,
      type: values.type as 1 | 2,
      merchantName: values.merchantName,
      nickname: values.nickname,
      phone: values.phone,
      contactPhone: values.contactPhone,
      status: values.status as 1 | 2,
    }
    if (values.password) {
      payload.password = values.password
    }
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
    const payload: IMerchantAddDTO = {
      nickname: values.nickname,
      phone: values.phone,
      password: values.password!,
      merchantName: values.merchantName,
      type: values.type as 1 | 2,
      contactPhone: values.contactPhone,
      status: values.status as 1 | 2,
    }
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
})
</script>

<template>
  <div class="max-h-[500px] overflow-y-auto">
    <form class="space-y-5" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="merchantName">
        <FormItem>
          <FormLabel>商户/物业名称</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="nickname">
        <FormItem>
          <FormLabel>昵称</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="phone">
        <FormItem>
          <FormLabel>手机号</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <FormLabel>{{ passwordLabel }}</FormLabel>
          <FormControl>
            <Input type="password" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="type">
        <FormItem>
          <FormLabel>类型</FormLabel>
          <FormControl>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="t in types" :key="t.value" :value="t.value">
                    {{ t.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="contactPhone">
        <FormItem>
          <FormLabel>联系电话</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="status">
        <FormItem>
          <FormLabel>状态</FormLabel>
          <FormControl>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="选择状态" />
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
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button type="submit" class="w-full" :disabled="isSubmitting">
        {{ isSubmitting ? '保存中...' : '保存' }}
      </Button>
    </form>
  </div>
</template>
