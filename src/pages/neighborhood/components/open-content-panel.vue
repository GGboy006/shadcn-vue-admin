<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { OpenContentType } from '@/services/api/neighborhood-governance.api'

import { RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetOpenListQuery, useUpdateOpenMutation } from '@/services/api/neighborhood-governance.api'

const props = defineProps<{
  type: OpenContentType
  label: string
}>()

const { data, isLoading } = useGetOpenListQuery()
const current = computed(() => (data.value?.data ?? []).find(item => item.type === props.type))

const { handleSubmit, resetForm, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(z.object({
    content: z.string().optional(),
  })),
  initialValues: { content: '' },
})

watch(current, (row) => {
  resetForm({ values: { content: row?.content ?? '' } })
}, { immediate: true })

const { mutate, isPending } = useUpdateOpenMutation()

const onSubmit = handleSubmit((formValues) => {
  mutate({ type: props.type, content: formValues.content ?? '' }, {
    onSuccess: () => toast.success('已保存'),
    onError: (err: Error) => toast.error(err.message || '保存失败'),
  })
})
</script>

<template>
  <div v-if="isLoading" class="space-y-3">
    <Skeleton class="h-8 w-40" />
    <Skeleton class="h-48 w-full" />
  </div>
  <form v-else class="space-y-4" @submit="onSubmit">
    <FormField name="content">
      <FormItem>
        <FormLabel>{{ label }}</FormLabel>
        <FormControl>
          <RichTextEditor
            :model-value="values.content ?? ''"
            placeholder="请输入正文"
            :min-height="240"
            @update:model-value="setFieldValue('content', $event ?? '')"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <div class="flex justify-end">
      <Button type="submit" :disabled="isPending">
        {{ isPending ? '保存中...' : '保存' }}
      </Button>
    </div>
  </form>
</template>
