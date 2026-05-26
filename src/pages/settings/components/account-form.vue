<script setup lang="ts">
import { AwardIcon, CrownIcon } from '@lucide/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useApiFetch } from '@/composables/use-fetch'
import { useUserInfoStore } from '@/stores/user-info'

import { accountValidator } from '../validators/account.validator'

const userInfoStore = useUserInfoStore()
const { apiFetch } = useApiFetch()

const stationInfo = computed(() => userInfoStore.stationInfo)

const stationLevelConfig: Record<number, { label: string, variant: 'info' | 'success' | 'warning' | 'gold' }> = {
  1: { label: '初级', variant: 'info' },
  2: { label: '中级', variant: 'success' },
  3: { label: '高级', variant: 'warning' },
  4: { label: '金牌', variant: 'gold' },
}

const accountFormSchema = toTypedSchema(accountValidator)

const { handleSubmit, resetForm } = useForm({
  validationSchema: accountFormSchema,
  initialValues: {
    stationName: stationInfo.value?.stationName || '',
    serviceScope: stationInfo.value?.serviceScope?.join(', ') || '',
    address: stationInfo.value?.address || '',
    contactPhone: stationInfo.value?.contactPhone || '',
    remark: stationInfo.value?.remark || '',
  },
})

watch(() => stationInfo.value, (info) => {
  if (info) {
    resetForm({
      values: {
        stationName: info.stationName || '',
        serviceScope: info.serviceScope?.join(', ') || '',
        address: info.address || '',
        contactPhone: info.contactPhone || '',
        remark: info.remark || '',
      },
    })
  }
}, { immediate: true })

const onSubmit = handleSubmit(async (formValues) => {
  if (!stationInfo.value?.stationId) {
    toast.error('站长信息不存在')
    return
  }

  await apiFetch('/station/updateStationInfo', {
    method: 'PUT',
    body: {
      stationId: stationInfo.value.stationId,
      stationName: formValues.stationName,
      serviceScope: formValues.serviceScope
        ? JSON.stringify(formValues.serviceScope.split(/[,，]/).map(s => s.trim()).filter(Boolean))
        : undefined,
      address: formValues.address,
      contactPhone: formValues.contactPhone,
      remark: formValues.remark,
    },
  })

  // 更新本地 store
  userInfoStore.setStationInfo({
    ...stationInfo.value,
    stationName: formValues.stationName,
    serviceScope: formValues.serviceScope
      ? formValues.serviceScope.split(/[,，]/).map(s => s.trim()).filter(Boolean)
      : [],
    address: formValues.address,
    contactPhone: formValues.contactPhone,
    remark: formValues.remark || '',
  })

  toast.success('站长信息更新成功')
})
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      站长信息
    </h3>
    <p class="text-sm text-muted-foreground">
      管理您的站点基本信息和联系方式。
    </p>
  </div>
  <Separator class="my-4" />
  <form class="space-y-8" @submit="onSubmit">
    <!-- 所属社区 -->
    <div>
      <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">所属社区</label>
      <p class="mt-2 text-sm text-foreground">
        {{ stationInfo?.communityName || '-' }}
      </p>
    </div>

    <!-- 站长等级 -->
    <FormField name="stationLevel">
      <FormItem>
        <FormLabel>站长等级</FormLabel>
        <FormControl>
          <Badge :variant="stationLevelConfig[stationInfo?.stationLevel ?? 0]?.variant || 'secondary'" class="text-sm px-3 py-1">
            <AwardIcon v-if="(stationInfo?.stationLevel ?? 0) !== 4" class="size-4" />
            <CrownIcon v-else class="size-4" />
            {{ stationLevelConfig[stationInfo?.stationLevel ?? 0]?.label || '未知' }}
          </Badge>
        </FormControl>
        <FormDescription>等级由平台根据业绩评定。</FormDescription>
      </FormItem>
    </FormField>

    <Separator class="my-4" />

    <!-- 站点名称 -->
    <FormField v-slot="{ componentField }" name="stationName">
      <FormItem>
        <FormLabel>站点名称</FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入站点名称" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 服务范围 -->
    <FormField v-slot="{ componentField }" name="serviceScope">
      <FormItem>
        <FormLabel>服务范围</FormLabel>
        <FormControl>
          <Input type="text" placeholder="如：商户运营, 居民服务, 物业对接" v-bind="componentField" />
        </FormControl>
        <FormDescription>多个服务用逗号分隔。</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 站点地址 -->
    <FormField v-slot="{ componentField }" name="address">
      <FormItem>
        <FormLabel>站点地址</FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入站点地址" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 联系电话 -->
    <FormField v-slot="{ componentField }" name="contactPhone">
      <FormItem>
        <FormLabel>联系电话</FormLabel>
        <FormControl>
          <Input type="tel" placeholder="请输入联系电话" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 备注 -->
    <FormField v-slot="{ componentField }" name="remark">
      <FormItem>
        <FormLabel>备注</FormLabel>
        <FormControl>
          <Textarea placeholder="请输入备注信息" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-start">
      <Button type="submit">
        更新站长信息
      </Button>
    </div>
  </form>
</template>
