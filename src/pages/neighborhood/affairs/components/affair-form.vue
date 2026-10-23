<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { Affair, AffairSave } from '@/services/api/neighborhood-resident.api'

import { DateTimePicker } from '@/components/prop-ui/date-picker'
import { RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateAffairMutation, useUpdateAffairMutation } from '@/services/api/neighborhood-resident.api'
import { optionalContactPhone, optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ row?: Affair }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.affairId)

const typeOptions = [
  { value: 1, label: '基础设施' },
  { value: 2, label: '环境卫生' },
  { value: 3, label: '公共服务' },
  { value: 4, label: '文体活动' },
  { value: 5, label: '其他' },
] as const
const statusOptions = [
  { value: 1, label: '待审核' },
  { value: 2, label: '讨论中' },
  { value: 3, label: '方案中' },
  { value: 4, label: '投票中' },
  { value: 5, label: '已解决' },
  { value: 6, label: '已驳回' },
] as const

const schema = z.object({
  name: z.string().trim().min(1, '请填写标题'),
  type: optionalNumber.refine((value): value is number => value === 1 || value === 2 || value === 3 || value === 4 || value === 5, '请选择类型'),
  status: optionalNumber,
  userName: optionalString,
  userPhone: optionalContactPhone,
  endTime: optionalString,
  content: optionalString,
  replyContent: optionalString,
  options: z.array(z.string()).optional(),
}).superRefine((form, ctx) => {
  if (form.status !== 4)
    return
  const names = (form.options ?? []).map(item => item.trim()).filter(Boolean)
  if (names.length < 2 || names.length > 6) {
    ctx.addIssue({
      code: 'custom',
      message: '投票中需要 2 到 6 个选项',
      path: ['options'],
    })
  }
})

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.row?.name ?? '',
    type: props.row?.type ?? 1,
    status: props.row?.status ?? 1,
    userName: props.row?.userName ?? '',
    userPhone: props.row?.userPhone ?? '',
    endTime: props.row?.endTime ?? '',
    content: props.row?.content ?? '',
    replyContent: props.row?.replyContent ?? '',
    options: props.row?.options?.length ? props.row.options.map(item => item.name) : ['', ''],
  },
})

function optionNames(source: Array<string | undefined> | undefined) {
  return (source ?? []).map(item => (item ?? '').trim()).filter(Boolean)
}

function votesFor(name: string) {
  return props.row?.options?.find(item => item.name === name)?.votes ?? 0
}

const willRewriteVotes = computed(() => {
  const hasVotes = props.row?.options?.some(item => item.votes > 0)
  if (!hasVotes)
    return false
  const names = optionNames(values.options)
  const original = (props.row?.options ?? []).map(item => item.name)
  return names.length !== original.length || names.some((name, index) => name !== original[index])
})

const { mutate: createRow, isPending: isCreating } = useCreateAffairMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateAffairMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

function updateOption(index: number, value: string | number) {
  const next = [...(values.options ?? [])]
  next[index] = String(value ?? '')
  setFieldValue('options', next)
}

function addOption() {
  const next = [...(values.options ?? [])]
  if (next.length >= 6)
    return
  setFieldValue('options', [...next, ''])
}

function removeOption(index: number) {
  setFieldValue('options', (values.options ?? []).filter((_, itemIndex) => itemIndex !== index))
}

const onSubmit = handleSubmit((form) => {
  const status = form.status === 2 ? 2 : form.status === 3 ? 3 : form.status === 4 ? 4 : form.status === 5 ? 5 : form.status === 6 ? 6 : 1
  const type = form.type === 2 ? 2 : form.type === 3 ? 3 : form.type === 4 ? 4 : form.type === 5 ? 5 : 1
  const names = optionNames(form.options)
  const original = (props.row?.options ?? []).map(item => item.name)
  const changed = names.length !== original.length || names.some((name, index) => name !== original[index])
  const payload: AffairSave = {
    affairId: isEdit.value ? props.row?.affairId : undefined,
    name: form.name.trim(),
    type,
    status,
    userName: form.userName?.trim() || undefined,
    userPhone: form.userPhone?.trim() || undefined,
    endTime: form.endTime?.trim() || undefined,
    content: form.content?.trim() || undefined,
    replyContent: form.replyContent?.trim() || undefined,
  }
  // 待审核等状态里填的选项也要保存。投票中名称没变时不传，避免把已有票数清掉。
  if (!isEdit.value) {
    if (names.length > 0)
      payload.options = names
  }
  else if (changed) {
    payload.options = names
  }
  const mutate = isEdit.value ? updateRow : createRow
  mutate(payload, {
    onSuccess: () => {
      toast.success(isEdit.value ? '已更新' : '已新增')
      emit('close')
    },
    onError: (err: Error) => toast.error(err.message || '保存失败'),
  })
}, (ctx) => {
  const message = Object.values(ctx.errors)[0]
  if (message)
    toast.error(String(message))
})
</script>

<template>
  <form class="space-y-4" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel required>
          标题
        </FormLabel>
        <FormControl><Input v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <div class="grid gap-4 sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="type">
        <FormItem>
          <FormLabel required>
            类型
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="item in typeOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="status">
        <FormItem>
          <FormLabel>状态</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="item in statusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="userName">
        <FormItem>
          <FormLabel>发起人</FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="userPhone">
        <FormItem>
          <FormLabel>电话</FormLabel>
          <FormControl><Input maxlength="20" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="endTime">
        <FormItem class="sm:col-span-2">
          <FormLabel>截止时间</FormLabel>
          <FormControl><DateTimePicker placeholder="选择时间" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
    <FormField name="content">
      <FormItem>
        <FormLabel>描述</FormLabel>
        <FormControl>
          <RichTextEditor
            :model-value="values.content ?? ''"
            placeholder="请输入描述"
            :min-height="160"
            @update:model-value="setFieldValue('content', $event ?? '')"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="replyContent">
      <FormItem>
        <FormLabel>办理意见</FormLabel>
        <FormControl><Textarea rows="3" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField name="options">
      <FormItem>
        <FormLabel>投票选项</FormLabel>
        <div class="space-y-2">
          <div v-for="(item, index) in values.options ?? []" :key="index" class="flex items-center gap-2">
            <Input :model-value="item" placeholder="选项名称" @update:model-value="updateOption(index, $event)" />
            <span v-if="votesFor(item) > 0" class="shrink-0 text-xs tabular-nums text-muted-foreground">{{ votesFor(item) }} 票</span>
            <Button type="button" variant="outline" @click="removeOption(index)">
              删除
            </Button>
          </div>
          <Button type="button" variant="outline" :disabled="(values.options?.length ?? 0) >= 6" @click="addOption">
            添加选项
          </Button>
        </div>
        <p class="text-xs text-muted-foreground">
          这里填的选项会保存。状态是投票中时，要有 2 到 6 个。
        </p>
        <p v-if="willRewriteVotes" class="text-xs text-destructive">
          这次保存会按当前选项重写，已有票数会清掉。
        </p>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
