<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { MailMessage, MailReplySave } from '@/services/api/neighborhood-resident.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useReplyMailMutation } from '@/services/api/neighborhood-resident.api'
import { optionalNumber } from '@/validators/common'

const props = defineProps<{ mail: MailMessage }>()
const emit = defineEmits<{ close: [] }>()

const showOptions = [
  { value: 1, label: '公开' },
  { value: 2, label: '不公开' },
] as const
const statusOptions = [
  { value: 2, label: '已回复' },
  { value: 3, label: '已办结' },
] as const

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(z.object({
    replyContent: z.string().trim().min(1, '请填写回复'),
    showStatus: optionalNumber,
    status: optionalNumber,
  })),
  initialValues: {
    replyContent: props.mail.replyContent ?? '',
    showStatus: props.mail.showStatus ?? 2,
    status: props.mail.status === 3 ? 3 : 2,
  },
})

const { mutate, isPending } = useReplyMailMutation()

const onSubmit = handleSubmit((form) => {
  const payload: MailReplySave = {
    mailId: props.mail.mailId,
    replyContent: form.replyContent.trim(),
    showStatus: form.showStatus === 1 ? 1 : 2,
    status: form.status === 3 ? 3 : 2,
  }
  mutate(payload, {
    onSuccess: () => {
      toast.success('已回复')
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
    <p class="whitespace-pre-wrap text-sm text-muted-foreground">
      {{ mail.content || '没有留言内容' }}
    </p>
    <FormField v-slot="{ componentField }" name="replyContent">
      <FormItem>
        <FormLabel required>
          回复
        </FormLabel>
        <FormControl><Textarea rows="5" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <div class="grid gap-4 sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="showStatus">
        <FormItem>
          <FormLabel>是否公开</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="item in showOptions" :key="item.value" :value="item.value">
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
                <SelectValue />
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
    </div>
    <p class="text-xs text-muted-foreground">
      居民端只看公开、并且已经回复或办结的来信。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存回复' }}
    </Button>
  </form>
</template>
