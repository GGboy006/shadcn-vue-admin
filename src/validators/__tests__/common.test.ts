import { describe, expect, it } from 'vitest'

import { optionalContactPhone, optionalInt, optionalNumber, optionalPhone, optionalString, requiredPhone } from '../common'

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

describe('requiredPhone', () => {
  it('合法 11 位手机号通过', () => {
    expect(requiredPhone.safeParse('13812345678').success).toBe(true)
  })

  it('首尾空格会被 trim 后通过', () => {
    const result = requiredPhone.safeParse('  13812345678  ')
    expect(result.success).toBe(true)
    expect(result.success && result.data).toBe('13812345678')
  })

  it.each([
    ['为空', ''],
    ['位数不足', '1381234'],
    ['位数超出', '138123456789'],
    ['含非数字', '1381234567a'],
    ['非法号段', '12812345678'],
    ['带分隔符', '138-1234-5678'],
  ])('%s时校验失败', (_, input) => {
    expect(requiredPhone.safeParse(input).success).toBe(false)
  })
})

describe('optionalPhone', () => {
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['空字符串', ''],
  ])('%s 时视为未填写,校验通过', (_, input) => {
    expect(optionalPhone.safeParse(input).success).toBe(true)
  })

  it('填了合法手机号通过', () => {
    expect(optionalPhone.safeParse('13812345678').success).toBe(true)
  })

  it('填了非法手机号失败', () => {
    expect(optionalPhone.safeParse('1381234').success).toBe(false)
  })
})

describe('optionalContactPhone', () => {
  it.each([
    ['手机号', '13812345678'],
    ['固话带区号', '0755-88889999'],
    ['固话带括号区号', '(0755)88889999'],
    ['带分机号', '010-12345678 8001'],
    ['报警短号', '110'],
    ['政务短号', '12345'],
    ['国际格式', '+8613812345678'],
  ])('%s 校验通过', (_, input) => {
    expect(optionalContactPhone.safeParse(input).success).toBe(true)
  })

  it.each([
    ['过短', '11'],
    ['超长', '1'.repeat(21)],
    ['含中文', '值班电话110'],
    ['含字母', 'tel110'],
  ])('%s 时校验失败', (_, input) => {
    expect(optionalContactPhone.safeParse(input).success).toBe(false)
  })

  it('留空视为未填写', () => {
    expect(optionalContactPhone.safeParse('').success).toBe(true)
  })
})
