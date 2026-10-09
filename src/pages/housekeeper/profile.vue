<route lang="yaml">
meta:
  roles: [9]
</route>

<script setup lang="ts">
import { LoaderIcon } from '@lucide/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import { BasicPage } from '@/components/global-layout'
import ImageUpload from '@/components/image-upload/image-upload.vue'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useOwnHousekeeperService } from '@/composables/use-own-housekeeper'
import { useUpload } from '@/composables/use-upload'
import { buildHousekeeperSelfProfilePayload } from '@/services/api/housekeeper-account'
import { useUpdateHousekeeperServiceMutation } from '@/services/api/housekeeper.api'
import { CONTACT_PHONE_MAX_LENGTH, optionalContactPhone, optionalString, showInvalidSubmitToast } from '@/validators/common'

const profileValidator = z.object({
  housekeeperId: optionalString,
  name: z.string({ error: '名称不能为空' }).min(1, '名称不能为空'),
  description: optionalString,
  icon: optionalString,
  coverImage: optionalString,
  contactName: optionalString,
  contactPhone: optionalContactPhone,
})

const { service, isLoading } = useOwnHousekeeperService()
const { mutate, isPending } = useUpdateHousekeeperServiceMutation()
const { upload } = useUpload()
const isUploading = ref(false)

const { handleSubmit, values, setFieldValue, resetForm } = useForm({
  validationSchema: toTypedSchema(profileValidator),
  initialValues: {
    name: '',
  },
})

watch(service, (item) => {
  if (!item)
    return
  resetForm({
    values: {
      housekeeperId: item.housekeeperId,
      name: item.name,
      description: item.description || undefined,
      icon: item.icon || undefined,
      coverImage: item.coverImage || undefined,
      contactName: item.contactName || undefined,
      contactPhone: item.contactPhone || undefined,
    },
  })
}, { immediate: true })

async function handleCoverUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return
  isUploading.value = true
  try {
    const url = await upload(file)
    setFieldValue('coverImage', url)
  }
  finally {
    isUploading.value = false
    target.value = ''
  }
}

const onSubmit = handleSubmit((formValues) => {
  if (!service.value)
    return
  mutate(buildHousekeeperSelfProfilePayload({
    housekeeperId: service.value.housekeeperId,
    name: formValues.name,
    description: formValues.description,
    icon: formValues.icon,
    coverImage: formValues.coverImage,
    contactName: formValues.contactName,
    contactPhone: formValues.contactPhone,
  }), {
    onSuccess: () => toast.success('已保存'),
    onError: (err: any) => toast.error(err.message || '保存失败'),
  })
}, showInvalidSubmitToast)
</script>

<template>
  <BasicPage
    title="本馆资料"
    description="可改名称、介绍和对外联系方式。登录号、密码和启停由站长维护"
    sticky
  >
    <div v-if="isLoading" class="text-sm text-muted-foreground">
      正在加载本馆资料...
    </div>
    <form v-else-if="service" class="max-w-xl space-y-6" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel required>
            名称
          </FormLabel>
          <FormControl>
            <Input placeholder="本馆名称" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField name="coverImage">
        <FormItem>
          <FormLabel>封面</FormLabel>
          <FormControl>
            <div class="flex items-center gap-3">
              <img v-if="values.coverImage" :src="values.coverImage" alt="封面" class="h-16 w-28 rounded border object-cover">
              <div v-else class="flex h-16 w-28 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                无
              </div>
              <label class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent">
                <LoaderIcon v-if="isUploading" class="size-4 animate-spin" />
                <span>{{ isUploading ? '上传中' : '上传' }}</span>
                <input type="file" accept="image/*" class="sr-only" @change="handleCoverUpload">
              </label>
            </div>
          </FormControl>
        </FormItem>
      </FormField>

      <FormField name="icon">
        <FormItem>
          <FormLabel>图标</FormLabel>
          <FormControl>
            <ImageUpload
              :model-value="values.icon"
              alt="图标"
              @update:model-value="(url) => setFieldValue('icon', url)"
            />
          </FormControl>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="description">
        <FormItem>
          <FormLabel>介绍</FormLabel>
          <FormControl>
            <Textarea rows="3" placeholder="服务介绍" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField v-slot="{ componentField }" name="contactName">
          <FormItem>
            <FormLabel>联系人</FormLabel>
            <FormControl>
              <Input placeholder="对外联系人" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="contactPhone">
          <FormItem>
            <FormLabel>对外电话</FormLabel>
            <FormControl>
              <Input type="tel" :maxlength="CONTACT_PHONE_MAX_LENGTH" placeholder="可以和登录号不同" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <p v-if="service.loginPhone" class="text-sm text-muted-foreground">
        登录手机号 {{ service.loginPhone }}，如需修改请联系站长
      </p>

      <Button type="submit" :disabled="isPending">
        {{ isPending ? '保存中...' : '保存' }}
      </Button>
    </form>
    <p v-else class="text-sm text-muted-foreground">
      没有找到本馆资料
    </p>
  </BasicPage>
</template>
