<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { MediateAcceptSave } from '@/services/api/neighborhood-resident.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAcceptMediateMutation, useGetMediatorListQuery } from '@/services/api/neighborhood-resident.api'

const props = defineProps<{ mediateId: string }>()
const emit = defineEmits<{ close: [] }>()

const { data, isLoading } = useGetMediatorListQuery()
const mediators = computed(() => {
  const source = data.value?.data
  const list = Array.isArray(source) ? source : []
  return list.filter(item => item.status === 1)
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(z.object({
    mediatorId: z.string().trim().min(1, '请选择调解员'),
  })),
  initialValues: { mediatorId: '' },
})

const { mutate, isPending } = useAcceptMediateMutation()

const onSubmit = handleSubmit((form) => {
  const payload: MediateAcceptSave = {
    mediateId: props.mediateId,
    mediatorId: form.mediatorId,
  }
  mutate(payload, {
    onSuccess: () => {
      toast.success('已受理')
      emit('close')
    },
    onError: (err: Error) => toast.error(err.message || '受理失败'),
  })
}, (ctx) => {
  const message = Object.values(ctx.errors)[0]
  if (message)
    toast.error(String(message))
})
</script>

<template>
  <form class="space-y-4" @submit="onSubmit">
    <p class="text-xs text-muted-foreground">
      受理后状态变为调解中。只列出在岗的调解员。
    </p>
    <p v-if="!isLoading && !mediators.length" class="text-sm text-muted-foreground">
      还没有在岗调解员，请先在调解员页签里添加。
    </p>
    <FormField v-else v-slot="{ componentField }" name="mediatorId">
      <FormItem>
        <FormLabel required>
          调解员
        </FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="请选择" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem v-for="item in mediators" :key="item.mediatorId" :value="item.mediatorId">
              {{ item.name }}{{ item.title ? ` · ${item.title}` : '' }}
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit" class="w-full" :disabled="isPending || !mediators.length">
      {{ isPending ? '保存中...' : '受理' }}
    </Button>
  </form>
</template>
