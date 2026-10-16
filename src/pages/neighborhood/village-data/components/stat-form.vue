<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { VillageStat, VillageStatSave } from '@/services/api/neighborhood-governance.api'

import ImageUpload from '@/components/image-upload/image-upload.vue'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateStatMutation, useUpdateStatMutation } from '@/services/api/neighborhood-governance.api'
import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{
  stat?: VillageStat
}>()

const emit = defineEmits<{ close: [] }>()

const isEdit = computed(() => !!props.stat?.statId)

const statusOptions = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const schema = z.object({
  statName: z.string().trim().min(1, '请填写指标名称'),
  statValue: optionalString,
  unit: optionalString,
  icon: optionalString,
  status: optionalNumber,
  sortOrder: optionalInt,
})

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    statName: props.stat?.statName ?? '',
    statValue: props.stat?.statValue ?? '',
    unit: props.stat?.unit ?? '',
    icon: props.stat?.icon ?? undefined,
    status: props.stat?.status ?? 1,
    sortOrder: props.stat?.sortOrder ?? undefined,
  },
})

const { mutate: createStat, isPending: isCreating } = useCreateStatMutation()
const { mutate: updateStat, isPending: isUpdating } = useUpdateStatMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

function buildPayload(form: z.infer<typeof schema>): VillageStatSave {
  return {
    statId: isEdit.value ? props.stat?.statId : undefined,
    statName: form.statName.trim(),
    statValue: form.statValue?.trim() || undefined,
    unit: form.unit?.trim() || undefined,
    icon: form.icon || undefined,
    status: form.status === 2 ? 2 : 1,
    sortOrder: form.sortOrder,
  }
}

const onSubmit = handleSubmit((form) => {
  const payload = buildPayload(form)
  const mutate = isEdit.value ? updateStat : createStat
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
    <FormField v-slot="{ componentField }" name="statName">
      <FormItem>
        <FormLabel required>
          指标名称
        </FormLabel>
        <FormControl>
          <Input placeholder="如：总户数" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <div class="grid gap-4 sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="statValue">
        <FormItem>
          <FormLabel>数值</FormLabel>
          <FormControl>
            <Input v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="unit">
        <FormItem>
          <FormLabel>单位</FormLabel>
          <FormControl>
            <Input placeholder="如：户" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="sortOrder">
        <FormItem>
          <FormLabel>排序</FormLabel>
          <FormControl>
            <Input type="number" placeholder="小的在前" v-bind="componentField" />
          </FormControl>
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
    </div>
    <FormField name="icon">
      <FormItem>
        <FormLabel>图标</FormLabel>
        <FormControl>
          <ImageUpload
            :model-value="values.icon"
            alt="指标图标"
            @update:model-value="setFieldValue('icon', $event || undefined)"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <p v-if="stat?.statCode" class="text-xs text-muted-foreground">
      编码 {{ stat.statCode }} 由服务端生成，居民端按这个编码取数，这里不能改。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
