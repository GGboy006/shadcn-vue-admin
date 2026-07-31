import { describe, expect, it } from 'vitest'

import { optionalInt, optionalNumber, optionalString } from '../common'

describe('optionalString', () => {
  it('保留非空字符串原值', () => {
    expect(optionalString.parse('hello')).toBe('hello')
  })

  it('将后端回显的 null 归一为 undefined(修复编辑模式校验报错)', () => {
    expect(optionalString.parse(null)).toBeUndefined()
  })

  it('空值/undefined 归一为 undefined', () => {
    expect(optionalString.parse(undefined)).toBeUndefined()
    expect(optionalString.parse('')).toBe('')
  })
})

describe('optionalNumber', () => {
  it('保留 number 原值(整数与小数)', () => {
    expect(optionalNumber.parse(10)).toBe(10)
    expect(optionalNumber.parse(18.5)).toBe(18.5)
  })
  it('将数字字符串转为 number', () => {
    expect(optionalNumber.parse('10')).toBe(10)
    expect(optionalNumber.parse('18.5')).toBe(18.5)
  })

  it.each([[''], [null], [undefined]])('空值/后端 null 归一为 undefined: %p', (v) => {
    expect(optionalNumber.parse(v)).toBeUndefined()
  })

  it('非数字字符串归一为 undefined(静默,不抛错)', () => {
    expect(optionalNumber.parse('abc')).toBeUndefined()
  })
})

describe('optionalInt', () => {
  it('整数(数字或字符串)通过并归一为 number', () => {
    expect(optionalInt.parse(3)).toBe(3)
    expect(optionalInt.parse('5')).toBe(5)
  })

  it.each([[''], [null], [undefined]])('空值通过并归一为 undefined: %p', (v) => {
    expect(optionalInt.parse(v)).toBeUndefined()
  })

  it.each([[1.5], ['1.5']])('小数校验失败并提示「请输入整数」: %p', (v) => {
    const r = optionalInt.safeParse(v)
    expect(r.success).toBe(false)
    if (!r.success)
      expect(r.error.issues[0]?.message).toBe('请输入整数')
  })

  it('非数字字符串归一为 undefined(不报整数错误)', () => {
    // optionalNumber 先把 'abc' coerce 为 undefined,refine 对 undefined 放行
    expect(optionalInt.parse('abc')).toBeUndefined()
  })
})
