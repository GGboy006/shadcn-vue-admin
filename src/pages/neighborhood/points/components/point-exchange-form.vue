<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { PointExchangeSave } from '@/services/api/neighborhood-resident.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useCreatePointExchangeMutation, useGetPointAccountListQuery, useGetPointGoodsListQuery } from '@/services/api/neighborhood-resident.api'

const emit = defineEmits<{ close: [] }>()

const { data: accountData, isLoading: accountsLoading } = useGetPointAccountListQuery()
const { data: goodsData, isLoading: goodsLoading } = useGetPointGoodsListQuery()
const accounts = computed(() => {
  const source = accountData.value?.data
  return Array.isArray(source) ? source : []
})
const goods = computed(() => {
  const source = goodsData.value?.data
  const list = Array.isArray(source) ? source : []
  return list.filter(item => item.status === 1)
})
const isLoading = computed(() => accountsLoading.value || goodsLoading.value)

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(z.object({
    userId: z.string().trim().min(1, '请选择居民'),
    goodsId: z.string().trim().min(1, '请选择商品'),
  })),
  initialValues: { userId: '', goodsId: '' },
})

const { mutate, isPending } = useCreatePointExchangeMutation()

const onSubmit = handleSubmit((form) => {
  const payload: PointExchangeSave = {
    userId: form.userId,
    goodsId: form.goodsId,
  }
  mutate(payload, {
    onSuccess: () => {
      toast.success('已兑换')
      emit('close')
    },
    onError: (err: Error) => toast.error(err.message || '兑换失败'),
  })
}, (ctx) => {
  const message = Object.values(ctx.errors)[0]
  if (message)
    toast.error(String(message))
})
</script>

<template>
  <div v-if="isLoading" class="space-y-3">
    <Skeleton class="h-10 w-full" />
    <Skeleton class="h-10 w-full" />
  </div>
  <form v-else class="space-y-4" @submit="onSubmit">
    <p v-if="!accounts.length || !goods.length" class="text-sm text-muted-foreground">
      {{ !accounts.length ? '还没有积分账户。' : '还没有上架商品。' }}
    </p>
    <template v-else>
      <FormField v-slot="{ componentField }" name="userId">
        <FormItem>
          <FormLabel required>
            居民
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="item in accounts" :key="item.accountId" :value="item.userId">
                {{ item.userName || item.userId }}（余额 {{ item.balance }}）
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="goodsId">
        <FormItem>
          <FormLabel required>
            商品
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="item in goods" :key="item.goodsId" :value="item.goodsId">
                {{ item.name }}（{{ item.points }} 分）
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
    </template>
    <p class="text-xs text-muted-foreground">
      这是替居民兑换。积分和库存由接口扣减。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending || !accounts.length || !goods.length">
      {{ isPending ? '保存中...' : '兑换' }}
    </Button>
  </form>
</template>
