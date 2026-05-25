<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'

import { displayValidator } from '../validators/display.validator'

const items = [
  {
    id: 'recents',
    label: 'Recents',
  },
  {
    id: 'home',
    label: 'Home',
  },
  {
    id: 'applications',
    label: 'Applications',
  },
  {
    id: 'desktop',
    label: 'Desktop',
  },
  {
    id: 'downloads',
    label: 'Downloads',
  },
  {
    id: 'documents',
    label: 'Documents',
  },
] as const

const displayFormSchema = toTypedSchema(displayValidator)

const { handleSubmit } = useForm({
  validationSchema: displayFormSchema,
  initialValues: {
    items: ['recents', 'home'],
  },
})

const onSubmit = handleSubmit((values) => {
  toast('提交的数据如下：', {
    description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify(values, null, 2))),
  })
})
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      显示设置
    </h3>
    <p class="text-sm text-muted-foreground">
      开启或关闭项目以控制应用中显示的内容。
    </p>
  </div>
  <Separator class="my-4" />
  <form @submit="onSubmit">
    <FormField name="items">
      <FormItem>
        <div class="mb-4">
          <FormLabel class="text-base">
            侧边栏
          </FormLabel>
          <FormDescription>
            选择要在侧边栏中显示的项目。
          </FormDescription>
        </div>

        <FormField v-for="item in items" v-slot="{ value, handleChange }" :key="item.id" name="items">
          <FormItem :key="item.id" class="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                :model-value="value.includes(item.id)"
                @update:model-value="(checked: boolean | 'indeterminate') => {
                  if (Array.isArray(value)) {
                    handleChange(checked ? [...value, item.id] : value.filter(id => id !== item.id))
                  }
                }"
              />
            </FormControl>
            <FormLabel class="font-normal">
              {{ item.label }}
            </FormLabel>
          </FormItem>
        </FormField>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-start mt-4">
      <Button type="submit">
        更新显示
      </Button>
    </div>
  </form>
</template>
