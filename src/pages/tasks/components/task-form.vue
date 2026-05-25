<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import { FormField } from '@/components/ui/form'

import type { Task } from '../data/schema'
import type { TaskValidator } from '../validators/task.validator'

import { labels, priorities, statuses } from '../data/data'
import { taskValidator } from '../validators/task.validator'

const props = defineProps<{
  task: Task | null
}>()
const emits = defineEmits(['close'])

const formSchema = toTypedSchema(taskValidator)

const initialValues = reactive<TaskValidator>({
  title: props.task ? props.task.title : '',
  status: props.task ? props.task.status : 'backlog',
  label: props.task ? props.task.label : 'feature',
  priority: props.task ? props.task.priority : 'medium',
})

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: formSchema,
  initialValues,
})
const onSubmit = handleSubmit((values) => {
  toast('提交的数据如下：', {
    description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify(values, null, 2))),
  })
  emits('close')
})
</script>

<template>
  <div>
    <form class="w-2/3 space-y-6" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="title" :validate-on-blur="!isFieldDirty">
        <UiFormItem>
          <UiFormLabel>标题</UiFormLabel>
          <UiFormControl>
            <UiInput type="text" placeholder="输入任务标题" v-bind="componentField" />
          </UiFormControl>
          <UiFormDescription />
          <UiFormMessage />
        </UiFormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="status" :validate-on-blur="!isFieldDirty">
        <UiFormItem>
          <UiFormLabel>状态</UiFormLabel>
          <UiFormControl>
            <UiSelect v-bind="componentField">
              <UiSelectTrigger class="w-[180px]">
                <UiSelectValue placeholder="选择状态" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectGroup>
                  <UiSelectItem v-for="status in statuses" :key="status.value" :value="status.value">
                    <div class="flex items-center gap-2">
                      <component :is="status.icon" class="size-4 shrink-0" />
                      {{ status.label }}
                    </div>
                  </UiSelectItem>
                </UiSelectGroup>
              </UiSelectContent>
            </UiSelect>
          </UiFormControl>
          <UiFormDescription />
          <UiFormMessage />
        </UiFormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="label" :validate-on-blur="!isFieldDirty">
        <UiFormItem>
          <UiFormLabel>标签</UiFormLabel>
          <UiFormControl>
            <UiRadioGroup
              class="flex flex-col space-y-1"
              v-bind="componentField"
            >
              <UiFormItem
                v-for="label in labels" :key="label.value"
                class="flex items-center space-y-0 gap-x-3"
              >
                <UiFormControl>
                  <UiRadioGroupItem :value="label.value" />
                </UiFormControl>
                <UiFormLabel class="font-normal">
                  {{ label.label }}
                </UiFormLabel>
              </UiFormItem>
            </UiRadioGroup>
          </UiFormControl>
          <UiFormDescription />
          <UiFormMessage />
        </UiFormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="priority" :validate-on-blur="!isFieldDirty">
        <UiFormItem>
          <UiFormLabel>优先级</UiFormLabel>
          <UiFormControl>
            <UiRadioGroup
              class="flex flex-col space-y-1"
              v-bind="componentField"
            >
              <UiFormItem
                v-for="priority in priorities" :key="priority.value"
                class="flex items-center space-y-0 gap-x-3"
              >
                <UiFormControl>
                  <UiRadioGroupItem :value="priority.value" />
                </UiFormControl>
                <UiFormLabel class="font-normal">
                  {{ priority.label }}
                </UiFormLabel>
              </UiFormItem>
            </UiRadioGroup>
          </UiFormControl>
          <UiFormDescription />
          <UiFormMessage />
        </UiFormItem>
      </FormField>

      <UiButton type="submit">
        提交
      </UiButton>
    </form>
  </div>
</template>
