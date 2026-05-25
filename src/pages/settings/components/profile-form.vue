<script setup lang="ts">
import { XIcon } from '@lucide/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { FieldArray, useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { profileValidator } from '../validators/profile.validator'

const verifiedEmails = ref(['m@example.com', 'm@google.com', 'm@support.com'])

const profileFormSchema = toTypedSchema(profileValidator)

const { handleSubmit, resetForm } = useForm({
  validationSchema: profileFormSchema,
  initialValues: {
    bio: 'I own a computer.',
    urls: [
      { value: 'https://shadcn.com' },
      { value: 'http://twitter.com/shadcn' },
    ],
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
      个人资料
    </h3>
    <p class="text-sm text-muted-foreground">
      这是其他人在网站上看到您的信息。
    </p>
  </div>
  <Separator orientation="horizontal" class="my-4" />
  <form class="space-y-8" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="username">
      <FormItem>
        <FormLabel>用户名</FormLabel>
        <FormControl>
          <Input type="text" placeholder="输入用户名" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          这是您的公开显示名称，可以是真实姓名或昵称。每30天只能修改一次。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <FormLabel>邮箱</FormLabel>

        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="选择邮箱" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="email in verifiedEmails" :key="email" :value="email">
                {{ email }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FormDescription>
          您可以在邮箱设置中管理已验证的邮箱地址。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="bio">
      <FormItem>
        <FormLabel>个人简介</FormLabel>
        <FormControl>
          <Textarea placeholder="简单介绍一下您自己" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          您可以 <span>@提及</span> 其他用户和组织以链接到他们。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <div>
      <FieldArray v-slot="{ fields, push, remove }" name="urls">
        <div v-for="(field, index) in fields" :key="`urls-${field.key}`" class="mb-2">
          <FormField v-slot="{ componentField }" :name="`urls[${index}].value`">
            <FormItem>
              <FormLabel :class="cn(index !== 0 && 'sr-only')">
                网址
              </FormLabel>
              <FormDescription :class="cn(index !== 0 && 'sr-only')">
                添加您的网站、博客或社交媒体主页链接。
              </FormDescription>
              <div class="relative flex items-center">
                <FormControl>
                  <Input type="url" v-bind="componentField" />
                </FormControl>
                <button type="button" class="absolute py-2 pe-3 end-0 text-muted-foreground" @click="remove(index)">
                  <XIcon class="w-3" />
                </button>
              </div>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          class="w-20 mt-2 text-xs"
          @click="push({ value: '' })"
        >
          添加网址
        </Button>
      </FieldArray>
    </div>

    <div class="flex justify-start gap-2">
      <Button type="submit">
        更新资料
      </Button>

      <Button
        type="button"
        variant="outline"
        @click="resetForm"
      >
        重置表单
      </Button>
    </div>
  </form>
</template>
