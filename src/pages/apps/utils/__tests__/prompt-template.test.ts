import { describe, expect, it } from 'vitest'

import type { IPromptTemplateField } from '../../types/prompt-template.types'

import { buildInitialValues, buildZodSchema } from '../prompt-template'

/** 造一个字段配置 */
function makeField(partial: Partial<IPromptTemplateField> & Pick<IPromptTemplateField, 'prop' | 'label'>): IPromptTemplateField {
  return {
    component: { name: 'input', attrs: {} },
    ...partial,
  }
}

const requiredInput = makeField({ prop: 'topic', label: '主题', isRequired: true })
const optionalInput = makeField({ prop: 'note', label: '备注', isRequired: false })
const requiredMultiSelect = makeField({
  prop: 'tags',
  label: '标签',
  isRequired: true,
  component: { name: 'select', attrs: { multiple: true } },
})
const optionalMultiSelect = makeField({
  prop: 'extra',
  label: '附加',
  isRequired: false,
  component: { name: 'select', attrs: { multiple: true } },
})

describe('buildZodSchema', () => {
  it('未填必填字段（undefined）应显示中文文案而非 zod 默认类型错误', () => {
    const schema = buildZodSchema([requiredInput])
    const result = schema.safeParse({})

    expect(result.success).toBe(false)
    if (!result.success) {
      const msg = result.error.issues[0]?.message
      expect(msg).toBe('主题不能为空')
      // 不应出现 zod v4 的默认类型错误文案
      expect(msg).not.toContain('Invalid input')
    }
  })

  it('必填字段为空字符串也应显示中文文案', () => {
    const schema = buildZodSchema([requiredInput])
    const result = schema.safeParse({ topic: '' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('主题不能为空')
    }
  })

  it('必填字段有值应通过校验', () => {
    const schema = buildZodSchema([requiredInput])
    expect(schema.safeParse({ topic: 'PPT大纲' }).success).toBe(true)
  })

  it('可选字段留空（undefined 或 空串）应通过校验', () => {
    const schema = buildZodSchema([optionalInput])
    expect(schema.safeParse({}).success).toBe(true)
    expect(schema.safeParse({ note: '' }).success).toBe(true)
  })

  it('rules 中 required:true 也应识别为必填', () => {
    const field = makeField({ prop: 'topic', label: '主题' })
    const schema = buildZodSchema([field], { topic: [{ required: true }] })
    const result = schema.safeParse({})

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('主题不能为空')
    }
  })

  it('必填多选未选（undefined）应显示中文文案', () => {
    const schema = buildZodSchema([requiredMultiSelect])
    const result = schema.safeParse({})

    expect(result.success).toBe(false)
    if (!result.success) {
      const msg = result.error.issues[0]?.message
      expect(msg).toBe('标签不能为空')
      expect(msg).not.toContain('Invalid input')
    }
  })

  it('必填多选选择后应通过，空数组应报错', () => {
    const schema = buildZodSchema([requiredMultiSelect])
    expect(schema.safeParse({ tags: ['a'] }).success).toBe(true)
    expect(schema.safeParse({ tags: [] }).success).toBe(false)
  })

  it('可选多选空数组应通过校验', () => {
    const schema = buildZodSchema([optionalMultiSelect])
    expect(schema.safeParse({ extra: [] }).success).toBe(true)
  })
})

describe('buildInitialValues', () => {
  it('单值字段初始为空字符串，多选字段初始为空数组', () => {
    const result = buildInitialValues([requiredInput, requiredMultiSelect])

    expect(result).toEqual({
      topic: '',
      tags: [],
    })
  })

  it('用 initialValues 后未填必填项仍能命中中文文案', () => {
    const fields = [requiredInput, requiredMultiSelect]
    const schema = buildZodSchema(fields)
    const result = schema.safeParse(buildInitialValues(fields))

    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map(i => i.message)
      expect(messages).toContain('主题不能为空')
      expect(messages).toContain('标签不能为空')
      expect(messages.every(m => !m.includes('Invalid input'))).toBe(true)
    }
  })
})
