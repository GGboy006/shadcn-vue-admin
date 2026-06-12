import * as z from 'zod'

import type { IPromptTemplateField, IPromptTemplateFieldCondition, IPromptTemplateForm, IPromptTemplateRule } from '../types/prompt-template.types'

/**
 * 解析 templateForm JSON 字符串
 * @param jsonString AgentPromptTemplate.templateForm
 * @returns 解析后的表单配置，解析失败返回 null
 */
export function parseTemplateForm(jsonString: string): IPromptTemplateForm | null {
  try {
    const parsed = JSON.parse(jsonString)
    if (!parsed || !Array.isArray(parsed.form)) {
      console.error('[parseTemplateForm] 表单配置缺少 form 数组')
      return null
    }
    return parsed as IPromptTemplateForm
  }
  catch (error) {
    console.error('[parseTemplateForm] 解析 templateForm 失败:', error)
    return null
  }
}

/**
 * 将字段值格式化为字符串（用于占位符替换）
 */
function formatFieldValue(value: unknown): string {
  if (value === undefined || value === null)
    return ''
  if (Array.isArray(value))
    return value.map(formatFieldValue).filter(Boolean).join('，')
  if (typeof value === 'object')
    return ''
  return String(value)
}

/**
 * 根据字段配置和表单数据生成最终 prompt
 * @param template user_msg 模板，如 "请根据主题：{主题}，风格：{风格}，生成PPT大纲"
 * @param fields 字段配置列表
 * @param formData 表单数据
 * @returns 替换后的 prompt
 */
export function replacePlaceholders(
  template: string,
  fields: IPromptTemplateField[],
  formData: Record<string, unknown>,
): string {
  // 按 label 建立字段值映射
  const labelToValue = new Map<string, string>()
  fields.forEach((field) => {
    labelToValue.set(field.label, formatFieldValue(formData[field.prop]))
  })

  // 收集模板中的分隔符（逗号、中文逗号、换行）
  const separators: string[] = []
  for (let i = 0; i < template.length; i++) {
    const char = template[i]
    if (char === '\n' || char === ',' || char === '，') {
      separators.push(char)
    }
  }

  // 按分隔符切分模板
  const segments = template.split(/[,，\n]/)
  const resultSegments: string[] = []
  const resultSeparators: string[] = []
  let sepIdx = 0

  for (const segment of segments) {
    const trimmedSegment = segment.trim()
    if (!trimmedSegment) {
      sepIdx++
      continue
    }

    const labels: string[] = []
    const processedSegment = trimmedSegment.replace(/\{([^}]+)\}/g, (_match, label) => {
      labels.push(label)
      return labelToValue.get(label) ?? ''
    })

    // 判断该段是否有效：没有占位符 或 至少一个占位符有值
    const hasValue = labels.length === 0 || labels.some((label) => {
      const value = labelToValue.get(label)
      return value !== undefined && value !== null && value !== ''
    })

    if (hasValue) {
      resultSegments.push(processedSegment)
      if (sepIdx < separators.length) {
        resultSeparators.push(separators[sepIdx])
      }
    }
    sepIdx++
  }

  // 拼接结果
  let result = ''
  resultSegments.forEach((segment, index) => {
    result += segment
    if (index < resultSeparators.length) {
      result += resultSeparators[index]
    }
  })

  return result
}

/**
 * 评估字段显示条件
 * @param conditions 条件配置
 * @param formData 当前表单数据
 */
export function evaluateCondition(
  conditions: IPromptTemplateFieldCondition,
  formData: Record<string, unknown>,
): boolean {
  if (!conditions?.when)
    return true

  const watchValue = formData[conditions.when]
  const targetValue = conditions.value

  switch (conditions.operator) {
    case '==':
      return String(watchValue) === String(targetValue)
    case '!=':
      return String(watchValue) !== String(targetValue)
    case '>':
      return Number(watchValue) > Number(targetValue)
    case '<':
      return Number(watchValue) < Number(targetValue)
    case '>=':
      return Number(watchValue) >= Number(targetValue)
    case '<=':
      return Number(watchValue) <= Number(targetValue)
    case 'include':
      if (Array.isArray(watchValue)) {
        return watchValue.map(String).includes(String(targetValue))
      }
      return targetValue
        ?.split(',')
        .map(v => v.trim())
        .includes(String(watchValue))
    case 'exclude':
      if (Array.isArray(watchValue)) {
        return !watchValue.map(String).includes(String(targetValue))
      }
      return !targetValue
        ?.split(',')
        .map(v => v.trim())
        .includes(String(watchValue))
    default:
      return true
  }
}

/**
 * 根据字段配置构建 zod 校验 schema
 * @param fields 字段配置列表
 * @param rules 后端返回的 rules（可选）
 */
export function buildZodSchema(
  fields: IPromptTemplateField[],
  rules?: Record<string, IPromptTemplateRule[]>,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}

  fields.forEach((field) => {
    const isMultiple = field.component.attrs.multiple
    const fieldRules = rules?.[field.prop] || []
    const isRequiredFromRules = fieldRules.some((rule: IPromptTemplateRule) =>
      rule?.required === true || rule?.required === 'true',
    )
    const isRequired = field.isRequired === true || isRequiredFromRules

    let schema: z.ZodTypeAny

    if (field.component.name === 'select' && isMultiple) {
      schema = z.array(z.string()).min(1, `${field.label}不能为空`)
      if (!isRequired) {
        schema = schema.or(z.array(z.string()).length(0))
      }
    }
    else {
      schema = z.string().min(1, `${field.label}不能为空`)
      if (!isRequired) {
        schema = schema.optional()
      }
    }

    shape[field.prop] = schema
  })

  return z.object(shape)
}

/**
 * 获取字段的示例值
 * @param field 字段配置
 */
export function getFieldExampleValue(field: IPromptTemplateField): unknown {
  const value = field.component.value
  if (value === undefined || value === null)
    return undefined

  if (field.component.name === 'select' && field.component.attrs.multiple) {
    return value.split(',').map(v => v.trim()).filter(Boolean)
  }
  return value.trim()
}

/**
 * 清空字段值
 * @param field 字段配置
 */
export function getFieldEmptyValue(field: IPromptTemplateField): unknown {
  if (field.component.name === 'select' && field.component.attrs.multiple) {
    return []
  }
  return ''
}
