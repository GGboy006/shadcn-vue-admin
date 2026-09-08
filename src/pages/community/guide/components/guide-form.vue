<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { ICommunityServiceGuide, ICommunityServiceGuideAddDTO, ICommunityServiceGuideUpdateDTO } from '@/services/api/community-service-guide.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUpload } from '@/composables/use-upload'
import { useCreateServiceGuideMutation, useUpdateServiceGuideMutation } from '@/services/api/community-service-guide.api'
import { CONTACT_PHONE_MAX_LENGTH, showInvalidSubmitToast } from '@/validators/common'

import type { CommunityServiceGuideValidator } from '../validators/guide.validator'

import { communityServiceGuideValidator } from '../validators/guide.validator'

const { guide } = defineProps<{
  guide?: ICommunityServiceGuide
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!guide?.uniqueCode)

const initialValues = reactive<CommunityServiceGuideValidator>({
  uniqueCode: guide?.uniqueCode || undefined,
  title: guide?.title || '',
  poster: guide?.poster || '',
  unit: guide?.unit || '',
  address: guide?.address || '',
  phone: guide?.phone || '',
  describe: guide?.describe || '',
  worktime: guide?.worktime || '',
  acceptanceConditions: guide?.acceptanceConditions || '',
  applicationMaterials: guide?.applicationMaterials || '',
  handlingProcedures: guide?.handlingProcedures || '',
  isEnable: guide?.isEnable ?? 1,
})

const formSchema = toTypedSchema(communityServiceGuideValidator)
const { handleSubmit, values: formValues, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const { upload } = useUpload()
async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return
  try {
    const url = await upload(file)
    setFieldValue('poster', url)
  }
  catch {
    // error handled by useUpload
  }
  finally {
    target.value = ''
  }
}

const { mutate: createMutate, isPending: isCreating } = useCreateServiceGuideMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateServiceGuideMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: CommunityServiceGuideValidator): ICommunityServiceGuideAddDTO | ICommunityServiceGuideUpdateDTO {
  const basePayload = {
    title: values.title,
    poster: values.poster || undefined,
    unit: values.unit || undefined,
    address: values.address || undefined,
    phone: values.phone || undefined,
    describe: values.describe || undefined,
    worktime: values.worktime || undefined,
    acceptanceConditions: values.acceptanceConditions || undefined,
    applicationMaterials: values.applicationMaterials || undefined,
    handlingProcedures: values.handlingProcedures || undefined,
    isEnable: values.isEnable as ICommunityServiceGuideAddDTO['isEnable'],
  }

  if (isEdit.value && guide) {
    return {
      uniqueCode: guide.uniqueCode,
      ...basePayload,
    } as ICommunityServiceGuideUpdateDTO
  }

  return basePayload as ICommunityServiceGuideAddDTO
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && guide) {
    updateMutate(payload as ICommunityServiceGuideUpdateDTO, {
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
    createMutate(payload as ICommunityServiceGuideAddDTO, {
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
    <!-- 标题 -->
    <FormField v-slot="{ componentField }" name="title">
      <FormItem>
        <FormLabel required>
          标题
        </FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入标题" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 封面图 -->
    <FormField name="poster">
      <FormItem>
        <FormLabel>封面图</FormLabel>
        <FormControl>
          <div class="flex items-center gap-3">
            <img v-if="formValues.poster" :src="formValues.poster" alt="封面" class="size-16 rounded border object-cover">
            <div v-else class="flex size-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
              无
            </div>
            <label class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              <span>上传</span>
              <input type="file" accept="image/*" class="sr-only" @change="handleFileUpload">
            </label>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 单位 + 电话 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="unit">
        <FormItem>
          <FormLabel>单位</FormLabel>
          <FormControl>
            <Input type="text" placeholder="单位" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="phone">
        <FormItem>
          <FormLabel>电话</FormLabel>
          <FormControl>
            <Input type="tel" :maxlength="CONTACT_PHONE_MAX_LENGTH" placeholder="支持手机号或固话" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 地址 -->
    <FormField v-slot="{ componentField }" name="address">
      <FormItem>
        <FormLabel>地址</FormLabel>
        <FormControl>
          <Input type="text" placeholder="地址" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 工作时间 + 启用状态 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="worktime">
        <FormItem>
          <FormLabel>工作时间</FormLabel>
          <FormControl>
            <Input type="text" placeholder="如:周一至周五 9:00-18:00" v-bind="componentField" />
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

    <!-- 描述 -->
    <FormField v-slot="{ componentField }" name="describe">
      <FormItem>
        <FormLabel>描述</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" placeholder="请输入描述" rows="2" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 受理条件 -->
    <FormField v-slot="{ componentField }" name="acceptanceConditions">
      <FormItem>
        <FormLabel>受理条件</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" placeholder="请输入受理条件" rows="4" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 申请材料 -->
    <FormField v-slot="{ componentField }" name="applicationMaterials">
      <FormItem>
        <FormLabel>申请材料</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" placeholder="请输入申请材料" rows="4" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 办理流程 -->
    <FormField v-slot="{ componentField }" name="handlingProcedures">
      <FormItem>
        <FormLabel>办理流程</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" placeholder="请输入办理流程" rows="4" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
