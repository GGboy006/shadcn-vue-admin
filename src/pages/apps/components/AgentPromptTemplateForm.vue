<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, watch } from 'vue'

import type { AgentPromptTemplate } from '@/services/api/skill.api'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { IPromptTemplateField, IPromptTemplateForm } from '../types/prompt-template.types'

import {
  buildZodSchema,
  evaluateCondition,
  getFieldEmptyValue,
  getFieldExampleValue,
  parseTemplateForm,
  replacePlaceholders,
} from '../utils/prompt-template'

interface Props {
  template: AgentPromptTemplate
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [content: string]
}>()

// ==================== 表单配置解析 ====================
const formConfig = computed<IPromptTemplateForm | null>(() => {
  return parseTemplateForm(props.template.templateForm)
})

const fields = computed(() => formConfig.value?.form ?? [])

const formSchema = computed(() => {
  return buildZodSchema(fields.value, formConfig.value?.rules)
})

// ==================== 表单状态 ====================
const { handleSubmit, resetForm, values, setFieldValue } = useForm({
  validationSchema: toTypedSchema(formSchema.value),
})

// ==================== 条件显示与联动清空 ====================
function isFieldVisible(field: IPromptTemplateField): boolean {
  if (!field.conditions)
    return true
  return evaluateCondition(field.conditions, values as Record<string, unknown>)
}

function clearDependentFields(parentProp: string) {
  fields.value.forEach((field) => {
    if (field.conditions?.when === parentProp) {
      setFieldValue(field.prop, getFieldEmptyValue(field))
      clearDependentFields(field.prop)
    }
  })
}

// 当某个字段变化时，清空依赖它的字段
watch(
  () => values,
  (newValues, oldValues) => {
    if (!oldValues)
      return
    fields.value.forEach((field) => {
      const prop = field.prop
      if ((newValues as Record<string, unknown>)[prop] !== (oldValues as Record<string, unknown>)[prop]) {
        clearDependentFields(prop)
      }
    })
  },
  { deep: true },
)

// ==================== 示例与清空 ====================
function fillExample() {
  fields.value.forEach((field) => {
    const example = getFieldExampleValue(field)
    if (example !== undefined) {
      setFieldValue(field.prop, example)
    }
  })
}

function clearForm() {
  resetForm()
}

// ==================== 提交 ====================
const onSubmit = handleSubmit((formData) => {
  const userMsgTemplate = formConfig.value?.user_msg
  if (!userMsgTemplate) {
    emit('submit', JSON.stringify(formData))
    return
  }
  const content = replacePlaceholders(userMsgTemplate, fields.value, formData as Record<string, unknown>)
  emit('submit', content)
})

// ==================== 辅助函数 ====================
function getWidthClass(ratio?: number): string {
  switch (ratio) {
    case 1:
      return 'w-full sm:w-1/4'
    case 2:
      return 'w-full sm:w-1/2'
    case 3:
      return 'w-full sm:w-3/4'
    default:
      return 'w-full'
  }
}

function getDisplayOptions(field: IPromptTemplateField) {
  return field.component.attrs.orginOptions?.filter(option => option.value !== '') ?? []
}
</script>

<template>
  <div class="w-full max-w-3xl mx-auto px-4 py-6">
    <!-- 模板标题 -->
    <div class="mb-6 text-center">
      <h3 class="text-lg font-semibold">
        {{ template.templateName }}
      </h3>
      <p v-if="template.templateDesc" class="text-sm text-muted-foreground mt-1">
        {{ template.templateDesc }}
      </p>
      <p v-if="template.subtitle" class="text-xs text-muted-foreground mt-0.5">
        {{ template.subtitle }}
      </p>
    </div>

    <!-- 表单 -->
    <form class="flex flex-wrap gap-4" @submit="onSubmit">
      <template v-for="field in fields" :key="field.prop">
        <div
          v-if="isFieldVisible(field)"
          :class="getWidthClass(field.widthRatio)"
        >
          <!-- input / textarea -->
          <FormField v-if="field.component.name === 'input'" v-slot="{ componentField }" :name="field.prop">
            <FormItem class="space-y-2">
              <FormLabel>{{ field.label }}</FormLabel>
              <FormControl>
                <UiTextarea
                  v-if="field.component.attrs.type === 'textarea'"
                  v-bind="componentField"
                  :placeholder="field.component.attrs.placeholder"
                  rows="4"
                />
                <UiInput
                  v-else
                  v-bind="componentField"
                  :placeholder="field.component.attrs.placeholder"
                />
              </FormControl>
              <FormDescription v-if="field.remarks">
                {{ field.remarks }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- select 下拉 -->
          <FormField
            v-else-if="field.component.name === 'select' && field.component.attrs.displayMode !== 'grid'"
            v-slot="{ componentField }"
            :name="field.prop"
          >
            <FormItem class="space-y-2">
              <FormLabel>{{ field.label }}</FormLabel>
              <FormControl>
                <Select v-bind="componentField" :multiple="field.component.attrs.multiple">
                  <FormControl>
                    <SelectTrigger :placeholder="field.component.attrs.placeholder" class="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem
                      v-for="option in getDisplayOptions(field)"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription v-if="field.remarks">
                {{ field.remarks }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- select grid 多选 -->
          <FormField
            v-else-if="field.component.name === 'select' && field.component.attrs.displayMode === 'grid' && field.component.attrs.multiple"
            v-slot="{ componentField }"
            :name="field.prop"
          >
            <FormItem class="space-y-2">
              <FormLabel>{{ field.label }}</FormLabel>
              <FormControl>
                <div class="flex flex-wrap gap-3">
                  <div
                    v-for="option in getDisplayOptions(field)"
                    :key="option.value"
                    class="flex items-center space-x-2 rounded-lg border px-3 py-2 hover:bg-muted/50"
                  >
                    <Checkbox
                      :id="`${field.prop}-${option.value}`"
                      :checked="(componentField.modelValue ?? []).includes(option.value)"
                      @update:checked="(checked: boolean) => {
                        const current = componentField.modelValue ?? []
                        const next = checked
                          ? [...current, option.value]
                          : current.filter((v: string) => v !== option.value)
                        componentField['onUpdate:modelValue']?.(next)
                      }"
                    />
                    <Label :for="`${field.prop}-${option.value}`" class="text-sm cursor-pointer">
                      {{ option.label }}
                    </Label>
                  </div>
                </div>
              </FormControl>
              <FormDescription v-if="field.remarks">
                {{ field.remarks }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- select grid 单选 -->
          <FormField
            v-else-if="field.component.name === 'select' && field.component.attrs.displayMode === 'grid'"
            v-slot="{ componentField }"
            :name="field.prop"
          >
            <FormItem class="space-y-2">
              <FormLabel>{{ field.label }}</FormLabel>
              <FormControl>
                <RadioGroup
                  v-bind="componentField"
                  class="flex flex-wrap gap-3"
                  @update:model-value="componentField['onUpdate:modelValue']"
                >
                  <div
                    v-for="option in getDisplayOptions(field)"
                    :key="option.value"
                    class="flex items-center space-x-2 rounded-lg border px-3 py-2 hover:bg-muted/50"
                  >
                    <RadioGroupItem :id="`${field.prop}-${option.value}`" :value="option.value" />
                    <Label :for="`${field.prop}-${option.value}`" class="text-sm cursor-pointer">
                      {{ option.label }}
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormDescription v-if="field.remarks">
                {{ field.remarks }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </template>

      <!-- 按钮 -->
      <div class="w-full flex items-center justify-between gap-3 mt-4 pt-4 border-t">
        <div class="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" @click="clearForm">
            清空
          </Button>
          <Button type="button" variant="secondary" size="sm" @click="fillExample">
            示例
          </Button>
        </div>
        <Button type="submit" size="sm">
          提交
        </Button>
      </div>
    </form>
  </div>
</template>
