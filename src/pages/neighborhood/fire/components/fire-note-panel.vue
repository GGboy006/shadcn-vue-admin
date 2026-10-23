<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import { RichTextContent, RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetFireNoteQuery, useUpdateFireNoteMutation } from '@/services/api/neighborhood-resident.api'

const editing = ref(false)
const { data, isLoading } = useGetFireNoteQuery()
const note = computed(() => data.value?.data)
const { handleSubmit, resetForm, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(z.object({ content: z.string().optional() })),
  initialValues: { content: '' },
})

function applyNote() {
  resetForm({ values: { content: note.value?.content ?? '' } })
}

watch(data, () => {
  if (!editing.value)
    applyNote()
}, { immediate: true })

function startEdit() {
  applyNote()
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  applyNote()
}

function hasHtml(value: string | null | undefined) {
  if (!value)
    return false
  return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0
}

const { mutate, isPending } = useUpdateFireNoteMutation()
const onSubmit = handleSubmit((form) => {
  mutate({ content: form.content ?? '' }, {
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
      <CardTitle>消防联防机制</CardTitle>
      <CardDescription>一个村只保留一条联防说明。</CardDescription>
      <CardAction v-if="!isLoading && !editing">
        <Button type="button" variant="outline" size="sm" @click="startEdit">
          编辑说明
        </Button>
      </CardAction>
    </CardHeader>
    <CardContent>
      <div v-if="isLoading" class="space-y-3">
        <Skeleton class="h-8 w-40" />
        <Skeleton class="h-48 w-full" />
      </div>
      <div v-else-if="!editing" class="text-sm">
        <RichTextContent v-if="hasHtml(note?.content)" :content="note?.content ?? ''" />
        <p v-else>
          还没有联防说明
        </p>
      </div>
      <form v-else class="space-y-4" @submit="onSubmit">
        <FormField name="content">
          <FormItem>
            <FormLabel>消防联防机制</FormLabel>
            <FormControl>
              <RichTextEditor
                :model-value="values.content ?? ''"
                placeholder="请输入联防机制"
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
