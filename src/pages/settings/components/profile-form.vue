<script setup lang="ts">
import { PencilIcon } from '@lucide/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { storeToRefs } from 'pinia'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useApiFetch } from '@/composables/use-fetch'
import { useUpload } from '@/composables/use-upload'
import { useAuthStore } from '@/stores/auth'

import { profileValidator } from '../validators/profile.validator'

const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)
const { upload, loading: uploadLoading } = useUpload()
const { apiFetch } = useApiFetch()

const profileFormSchema = toTypedSchema(profileValidator)

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: profileFormSchema,
  initialValues: {
    nickname: userInfo.value?.nickname || '',
    phone: userInfo.value?.phone || '',
    gender: userInfo.value?.gender ?? 0,
    avatar: userInfo.value?.avatar || '',
  },
})

const avatarUrl = computed(() => values.avatar || userInfo.value?.avatar || '')

async function handleAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return

  try {
    const url = await upload(file)
    setFieldValue('avatar', url)
    if (userInfo.value) {
      authStore.setUserInfo({ ...userInfo.value, avatar: url })
    }
    toast.success('头像上传成功')
  }
  catch {
    // 错误已在 useUpload 中 toast
  }
  finally {
    target.value = ''
  }
}

const onSubmit = handleSubmit(async (formValues) => {
  const res = await apiFetch('/login/current', {
    method: 'PUT',
    body: {
      nickname: formValues.nickname,
      avatar: formValues.avatar,
      gender: formValues.gender,
    },
  })

  authStore.setUserInfo(res.data)
  toast.success('个人资料更新成功')
})
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      个人资料
    </h3>
    <p class="text-sm text-muted-foreground">
      管理您的个人信息和头像。
    </p>
  </div>
  <Separator orientation="horizontal" class="my-4" />
  <form class="space-y-8" @submit="onSubmit">
    <!-- 头像 -->
    <FormField name="avatar">
      <FormItem>
        <FormLabel>头像</FormLabel>
        <div class="flex items-center gap-4">
          <Avatar class="size-20">
            <AvatarImage :src="avatarUrl" alt="头像" />
            <AvatarFallback class="text-sm text-muted-foreground">
              暂无头像
            </AvatarFallback>
          </Avatar>
          <div>
            <label
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground"
            >
              <PencilIcon class="size-4" />
              {{ uploadLoading ? '上传中...' : '更换头像' }}
              <input
                type="file"
                accept="image/*"
                class="sr-only"
                :disabled="uploadLoading"
                @change="handleAvatarChange"
              >
            </label>
            <FormDescription class="mt-2">
              支持 JPG、PNG、WebP 格式，最大 10MB。
            </FormDescription>
          </div>
        </div>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 昵称 -->
    <FormField v-slot="{ componentField }" name="nickname">
      <FormItem>
        <FormLabel>昵称</FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入昵称" v-bind="componentField" />
        </FormControl>
        <!-- <FormDescription>
          您的公开显示名称。
        </FormDescription> -->
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 手机号 -->
    <FormField v-slot="{ componentField }" name="phone">
      <FormItem>
        <FormLabel>手机号</FormLabel>
        <FormControl>
          <Input type="tel" v-bind="componentField" disabled />
        </FormControl>
        <FormDescription>
          手机号不可修改，如需更换请联系管理员。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 性别 -->
    <FormField v-slot="{ componentField }" name="gender">
      <FormItem>
        <FormLabel>性别</FormLabel>
        <Select v-bind="componentField" @update:model-value="(v) => setFieldValue('gender', Number(v))">
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="选择性别" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectGroup>
              <SelectItem :value="0">
                未知
              </SelectItem>
              <SelectItem :value="1">
                男
              </SelectItem>
              <SelectItem :value="2">
                女
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FormDescription>
          选择您的性别。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-start">
      <Button type="submit">
        更新资料
      </Button>
    </div>
  </form>
</template>
