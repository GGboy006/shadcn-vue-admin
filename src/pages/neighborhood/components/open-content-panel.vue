<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { OpenContentType } from '@/services/api/neighborhood-governance.api'

import { RichTextContent, RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetOpenListQuery, useUpdateOpenMutation } from '@/services/api/neighborhood-governance.api'

const props = defineProps<{
  type: OpenContentType
  label: string
}>()

const editing = ref(false)
const { data, isLoading } = useGetOpenListQuery()
const current = computed(() => (data.value?.data ?? []).find(item => item.type === props.type))

const { handleSubmit, resetForm, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(z.object({
    content: z.string().optional(),
  })),
  initialValues: { content: '' },
})

function applyContent() {
  resetForm({ values: { content: current.value?.content ?? '' } })
}

watch(current, () => {
  if (!editing.value)
    applyContent()
}, { immediate: true })

function startEdit() {
  applyContent()
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  applyContent()
}

function hasHtml(value: string | null | undefined) {
  if (!value)
    return false
  return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0
}

const { mutate, isPending } = useUpdateOpenMutation()

const onSubmit = handleSubmit((formValues) => {
  mutate({ type: props.type, content: formValues.content ?? '' }, {
    onSuccess: () => {
      editing.value = false
      toast.success('已保存')
    },
    onError: (err: Error) => toast.error(err.message || '保存失败'),
  })
})
</script>

<template>
  <Card>
    <CardHeader class="border-b">
      <CardTitle>{{ label }}</CardTitle>
      <CardDescription>一个村只保留一条。</CardDescription>
      <CardAction v-if="!isLoading && !editing">
        <Button type="button" variant="outline" size="sm" @click="startEdit">
          编辑
        </Button>
      </CardAction>
    </CardHeader>
    <CardContent>
      <div v-if="isLoading" class="space-y-3">
        <Skeleton class="h-8 w-40" />
        <Skeleton class="h-48 w-full" />
      </div>
      <div v-else-if="!editing" class="text-sm">
        <RichTextContent v-if="hasHtml(current?.content)" :content="current?.content ?? ''" />
        <p v-else>
          还没有正文
        </p>
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
        <div class="flex justify-end gap-2">
          <Button type="button" variant="outline" :disabled="isPending" @click="cancelEdit">
            取消
          </Button>
          <Button type="submit" :disabled="isPending">
            {{ isPending ? '保存中...' : '保存' }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
