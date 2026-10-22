<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { RepairProgressSave } from '@/services/api/neighborhood-resident.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useCreateRepairProgressMutation, useGetRepairDetailQuery } from '@/services/api/neighborhood-resident.api'
import { optionalNumber } from '@/validators/common'

const props = defineProps<{ repairId: string }>()
const emit = defineEmits<{ close: [] }>()

const { data, isLoading } = useGetRepairDetailQuery(() => props.repairId)
const detail = computed(() => data.value?.data)
const logs = computed(() => detail.value?.logs ?? [])

const logStatusOptions = [
  { value: 2, label: '普通进度' },
  { value: 1, label: '关键节点' },
] as const
const finishOptions = [
  { value: 2, label: '只记进度' },
  { value: 1, label: '同时办结' },
] as const

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(z.object({
    content: z.string().trim().min(1, '请填写进度说明'),
    status: optionalNumber,
    finish: optionalNumber,
  })),
  initialValues: { content: '', status: 2, finish: 2 },
})

const { mutate, isPending } = useCreateRepairProgressMutation()

const onSubmit = handleSubmit((form) => {
  const payload: RepairProgressSave = {
    repairId: props.repairId,
    content: form.content.trim(),
    status: form.status === 1 ? 1 : 2,
    finish: form.finish === 1 ? 1 : 2,
  }
  mutate(payload, {
    onSuccess: () => {
      toast.success(payload.finish === 1 ? '已办结' : '已记录进度')
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
  <div v-if="isLoading" class="space-y-3">
    <Skeleton class="h-8 w-40" />
    <Skeleton class="h-32 w-full" />
  </div>
  <div v-else-if="detail" class="space-y-6">
    <p class="text-sm">
      {{ detail.name || detail.code || '这条报修' }}
      <span class="text-muted-foreground">· {{ detail.statusLabel || '-' }}</span>
    </p>
    <section class="space-y-3">
      <h3 class="text-sm font-medium">
        已有进度
      </h3>
      <p v-if="!logs.length" class="text-sm text-muted-foreground">
        还没有进度
      </p>
      <ul v-else class="space-y-3">
        <li v-for="log in logs" :key="log.logId" class="border-l-2 pl-3">
          <div class="text-xs text-muted-foreground">
            {{ log.createTime }} · {{ log.statusLabel }}
          </div>
          <div class="whitespace-pre-wrap text-sm">
            {{ log.content }}
          </div>
        </li>
      </ul>
    </section>
    <form class="space-y-4 border-t pt-4" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="content">
        <FormItem>
          <FormLabel required>
            进度说明
          </FormLabel>
          <FormControl><Textarea rows="3" placeholder="这次处理了什么" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <div class="grid gap-4 sm:grid-cols-2">
        <FormField v-slot="{ componentField }" name="status">
          <FormItem>
            <FormLabel>进度类型</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem v-for="item in logStatusOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="finish">
          <FormItem>
            <FormLabel>是否办结</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem v-for="item in finishOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
      <Button type="submit" class="w-full" :disabled="isPending">
        {{ isPending ? '保存中...' : '记录进度' }}
      </Button>
    </form>
  </div>
  <p v-else class="text-sm text-muted-foreground">
    没有读到这条报修
  </p>
</template>
