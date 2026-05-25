<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

import { notificationsValidator } from '../validators/notifications.validator'

const notificationsFormSchema = toTypedSchema(notificationsValidator)

const { handleSubmit } = useForm({
  validationSchema: notificationsFormSchema,
  initialValues: {
    communication_emails: false,
    marketing_emails: false,
    social_emails: true,
    security_emails: true,
  },
})

const onSubmit = handleSubmit((values) => {
  toast('提交的数据如下：', {
    description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify(values, null, 2))),
  })
})
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      通知设置
    </h3>
    <p class="text-sm text-muted-foreground">
      配置您接收通知的方式。
    </p>
  </div>
  <Separator class="my-4" />
  <form class="space-y-8" @submit="onSubmit">
    <FormField v-slot="{ componentField }" type="radio" name="type">
      <FormItem class="space-y-3">
        <FormLabel>通知我关于...</FormLabel>
        <FormControl>
          <RadioGroup
            class="flex flex-col space-y-1"
            v-bind="componentField"
          >
            <FormItem class="flex items-center  space-y-0">
              <FormControl>
                <RadioGroupItem value="all" />
              </FormControl>
              <FormLabel class="font-normal">
                所有新消息
              </FormLabel>
            </FormItem>
            <FormItem class="flex items-center  space-y-0">
              <FormControl>
                <RadioGroupItem value="mentions" />
              </FormControl>
              <FormLabel class="font-normal">
                私信和提及
              </FormLabel>
            </FormItem>
            <FormItem class="flex items-center  space-y-0">
              <FormControl>
                <RadioGroupItem value="none" />
              </FormControl>
              <FormLabel class="font-normal">
                不通知
              </FormLabel>
            </FormItem>
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div>
      <h3 class="mb-4 text-lg font-medium">
        邮件通知
      </h3>
      <div class="space-y-4">
        <FormField v-slot="{ handleChange, value }" type="checkbox" name="communication_emails">
          <FormItem class="flex flex-row items-center justify-between p-4 border rounded-lg">
            <div class="space-y-0.5">
              <FormLabel class="text-base">
                通信邮件
              </FormLabel>
              <FormDescription>
                接收关于账户活动的邮件。
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                :checked="value"
                @update:checked="handleChange"
              />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ handleChange, value }" type="checkbox" name="marketing_emails">
          <FormItem class="flex flex-row items-center justify-between p-4 border rounded-lg">
            <div class="space-y-0.5">
              <FormLabel class="text-base">
                营销邮件
              </FormLabel>
              <FormDescription>
                接收关于新产品、功能等信息的邮件。
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                :checked="value"
                @update:checked="handleChange"
              />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ handleChange, value }" type="checkbox" name="social_emails">
          <FormItem class="flex flex-row items-center justify-between p-4 border rounded-lg">
            <div class="space-y-0.5">
              <FormLabel class="text-base">
                社交邮件
              </FormLabel>
              <FormDescription>
                接收好友请求、关注等信息的邮件。
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                :checked="value"
                @update:checked="handleChange"
              />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ handleChange, value }" type="checkbox" name="security_emails">
          <FormItem class="flex flex-row items-center justify-between p-4 border rounded-lg">
            <div class="space-y-0.5">
              <FormLabel class="text-base">
                安全邮件
              </FormLabel>
              <FormDescription>
                接收关于账户活动和安全的邮件。
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                :checked="value"
                @update:checked="handleChange"
              />
            </FormControl>
          </FormItem>
        </FormField>
      </div>
    </div>

    <FormField v-slot="{ handleChange, value }" type="checkbox" name="mobile">
      <FormItem class="flex flex-row items-start space-x-3 space-y-0">
        <FormControl>
          <Checkbox
            :model-value="value"
            @update:model-value="handleChange"
          />
        </FormControl>
        <div class="space-y-1 leading-none">
          <FormLabel>
            为移动设备使用不同的设置
          </FormLabel>
          <FormDescription>
            您可以在
            <a href="/examples/forms">
              移动设置
            </a> 页面管理移动通知。
          </FormDescription>
        </div>
      </FormItem>
    </FormField>

    <div class="flex justify-start">
      <Button type="submit">
        更新通知设置
      </Button>
    </div>
  </form>
</template>
