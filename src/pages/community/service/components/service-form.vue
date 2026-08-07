<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { ICommunityService, ICommunityServiceAddDTO, ICommunityServiceUpdateDTO } from '@/services/api/community-service.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUpload } from '@/composables/use-upload'
import { useCreateServiceMutation, useUpdateServiceMutation } from '@/services/api/community-service.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { CommunityServiceValidator } from '../validators/service.validator'

import { communityServiceValidator } from '../validators/service.validator'

const { service } = defineProps<{
  service?: ICommunityService
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

// 服务类型选项(对接文档 14 节 · 小区服务 type)
const typeList = [
  { value: 1, label: '小程序' },
  { value: 2, label: 'H5网页' },
  { value: 3, label: '阅览室' },
  { value: 14, label: '商户' },
  { value: 15, label: 'AI助手' },
  { value: 16, label: '社区商品' },
  { value: 17, label: '社区AI助手' },
] as const

const locationList = [
  { value: 1, label: '顶部' },
  { value: 2, label: '中部' },
  { value: 3, label: '底部' },
] as const

const serviceTypeList = [
  { value: 1, label: '社区服务' },
  { value: 2, label: '阅读服务' },
] as const

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!service?.uniqueCode)

const initialValues = reactive<CommunityServiceValidator>({
  uniqueCode: service?.uniqueCode || undefined,
  name: service?.name || '',
  poster: service?.poster || '',
  backgroundPoster: service?.backgroundPoster || '',
  describe: service?.describe || '',
  torder: service?.torder ?? undefined,
  isEnable: service?.isEnable ?? 1,
  location: service?.location ?? undefined,
  type: service?.type ?? 2,
  cateCode: service?.cateCode || '',
  cateName: service?.cateName || '',
  serviceType: service?.serviceType ?? undefined,
  otherCode: service?.otherCode || '',
  appId: service?.appId || '',
  originalAppId: service?.originalAppId || '',
  bdAppKey: service?.bdAppKey || '',
  readingCode: service?.readingCode || '',
  serviceCode: service?.serviceCode || '',
  h5Url: service?.h5Url || '',
  appUrl: service?.appUrl || '',
  linkUrl: service?.linkUrl || '',
  address: service?.address || '',
  businessHours: service?.businessHours || '',
  serviceList: service?.serviceList || '',
})

const formSchema = toTypedSchema(communityServiceValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

// type 联动显隐:1=小程序(appId/originalAppId/bdAppKey)、2=H5(h5Url)、3=阅览室(readingCode/serviceCode)、
// 14=商户(otherCode 商户码)、15/17=AI助手(otherCode thirdId)
const currentType = computed(() => Number(formValues.type) as ICommunityServiceAddDTO['type'])
const isMiniProgram = computed(() => currentType.value === 1)
const isH5 = computed(() => currentType.value === 2)
const isReadingRoom = computed(() => currentType.value === 3)
const isMerchant = computed(() => currentType.value === 14)
const isAiTool = computed(() => currentType.value === 15 || currentType.value === 17)

const { upload } = useUpload()
async function handleFileUpload(event: Event, field: 'poster' | 'backgroundPoster') {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return
  try {
    const url = await upload(file)
    setFieldValue(field, url)
  }
  catch {
    // error handled by useUpload
  }
  finally {
    target.value = ''
  }
}

const { mutate: createMutate, isPending: isCreating } = useCreateServiceMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateServiceMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: CommunityServiceValidator): ICommunityServiceAddDTO | ICommunityServiceUpdateDTO {
  const type = values.type as ICommunityServiceAddDTO['type']

  const basePayload = {
    name: values.name,
    poster: values.poster || undefined,
    backgroundPoster: values.backgroundPoster || undefined,
    describe: values.describe || undefined,
    torder: values.torder ?? undefined,
    isEnable: values.isEnable as 1 | 2 | undefined,
    location: values.location as 1 | 2 | 3 | undefined,
    type,
    cateCode: values.cateCode || undefined,
    cateName: values.cateName || undefined,
    serviceType: values.serviceType as 1 | 2 | undefined,
    otherCode: values.otherCode || undefined,
    appId: values.appId || undefined,
    originalAppId: values.originalAppId || undefined,
    bdAppKey: values.bdAppKey || undefined,
    readingCode: values.readingCode || undefined,
    serviceCode: values.serviceCode || undefined,
    h5Url: values.h5Url || undefined,
    appUrl: values.appUrl || undefined,
    linkUrl: values.linkUrl || undefined,
    address: values.address || undefined,
    businessHours: values.businessHours || undefined,
    serviceList: values.serviceList || undefined,
  }

  if (isEdit.value && service) {
    return {
      uniqueCode: service.uniqueCode,
      ...basePayload,
    } as ICommunityServiceUpdateDTO
  }

  return basePayload as ICommunityServiceAddDTO
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && service) {
    updateMutate(payload as ICommunityServiceUpdateDTO, {
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
    createMutate(payload as ICommunityServiceAddDTO, {
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
    <!-- 名称 + 服务类型 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel required>
            服务名称
          </FormLabel>
          <FormControl>
            <Input type="text" placeholder="请输入服务名称" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="type">
        <FormItem>
          <FormLabel required>
            服务类型
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择服务类型" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="t in typeList" :key="t.value" :value="t.value">
                  {{ t.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 分类编码 + 分类名称 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="cateCode">
        <FormItem>
          <FormLabel>分类编码</FormLabel>
          <FormControl>
            <Input type="text" placeholder="关联分类编码" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="cateName">
        <FormItem>
          <FormLabel>分类名称</FormLabel>
          <FormControl>
            <Input type="text" placeholder="分类名称" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 封面 -->
    <FormField name="poster">
      <FormItem>
        <FormLabel>封面图</FormLabel>
        <FormControl>
          <div class="flex items-center gap-3">
            <img v-if="formValues.poster" :src="formValues.poster" alt="封面" class="h-16 w-28 rounded border object-cover">
            <div v-else class="flex h-16 w-28 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
              无
            </div>
            <label class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              <span>上传</span>
              <input type="file" accept="image/*" class="sr-only" @change="(e: Event) => handleFileUpload(e, 'poster')">
            </label>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 背景图 -->
    <FormField name="backgroundPoster">
      <FormItem>
        <FormLabel>背景图</FormLabel>
        <FormControl>
          <div class="flex items-center gap-3">
            <img v-if="formValues.backgroundPoster" :src="formValues.backgroundPoster" alt="背景图" class="h-16 w-full max-w-[200px] rounded border object-cover">
            <div v-else class="flex h-16 w-full max-w-[200px] items-center justify-center rounded bg-muted text-xs text-muted-foreground">
              无
            </div>
            <label class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              <span>上传</span>
              <input type="file" accept="image/*" class="sr-only" @change="(e: Event) => handleFileUpload(e, 'backgroundPoster')">
            </label>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 描述 -->
    <FormField v-slot="{ componentField }" name="describe">
      <FormItem>
        <FormLabel>描述</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" placeholder="请输入服务描述" rows="2" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- H5 字段(H5 类型) -->
    <FormField v-if="isH5" v-slot="{ componentField }" name="h5Url">
      <FormItem>
        <FormLabel>H5 地址</FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入 H5 地址" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 小程序字段(小程序类型) -->
    <template v-if="isMiniProgram">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField v-slot="{ componentField }" name="appId">
          <FormItem>
            <FormLabel>微信小程序 APPID</FormLabel>
            <FormControl>
              <Input type="text" placeholder="微信小程序 APPID" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="originalAppId">
          <FormItem>
            <FormLabel>微信原始 appid</FormLabel>
            <FormControl>
              <Input type="text" placeholder="微信原始 appid" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <FormField v-slot="{ componentField }" name="bdAppKey">
        <FormItem>
          <FormLabel>百度小程序 key</FormLabel>
          <FormControl>
            <Input type="text" placeholder="百度小程序 key" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </template>

    <!-- 阅览室字段(阅览室类型) -->
    <template v-if="isReadingRoom">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField v-slot="{ componentField }" name="readingCode">
          <FormItem>
            <FormLabel>阅览室编码</FormLabel>
            <FormControl>
              <Input type="text" placeholder="阅览室编码" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="serviceCode">
          <FormItem>
            <FormLabel>服务编码</FormLabel>
            <FormControl>
              <Input type="text" placeholder="服务编码" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
    </template>

    <!-- 外部标识(商户/AI助手类型) -->
    <FormField v-if="isMerchant || isAiTool" v-slot="{ componentField }" name="otherCode">
      <FormItem>
        <FormLabel>
          {{ isMerchant ? '商户码' : '第三方工具ID(thirdId)' }}
        </FormLabel>
        <FormControl>
          <Input type="text" :placeholder="isMerchant ? '商户码' : 'thirdId'" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 跳转链接 / APP 地址 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="linkUrl">
        <FormItem>
          <FormLabel>跳转链接</FormLabel>
          <FormControl>
            <Input type="text" placeholder="跳转链接" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="appUrl">
        <FormItem>
          <FormLabel>APP 地址</FormLabel>
          <FormControl>
            <Input type="text" placeholder="APP 地址" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 地址 + 营业时间 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="address">
        <FormItem>
          <FormLabel>地址</FormLabel>
          <FormControl>
            <Input type="text" placeholder="地址" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="businessHours">
        <FormItem>
          <FormLabel>营业时间</FormLabel>
          <FormControl>
            <Input type="text" placeholder="营业时间" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 多服务栏目 -->
    <FormField v-slot="{ componentField }" name="serviceList">
      <FormItem>
        <FormLabel>多服务栏目</FormLabel>
        <FormControl>
          <Input type="text" placeholder="多服务栏目配置" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 服务大类 + 位置 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="serviceType">
        <FormItem>
          <FormLabel>服务大类</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="s in serviceTypeList" :key="s.value" :value="s.value">
                  {{ s.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="location">
        <FormItem>
          <FormLabel>位置</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择位置" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="l in locationList" :key="l.value" :value="l.value">
                  {{ l.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 排序 + 启用状态 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="torder">
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

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
