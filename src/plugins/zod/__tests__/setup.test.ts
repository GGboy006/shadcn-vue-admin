import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { setupZod } from '../setup'

describe('setupZod', () => {
  it('将 zod 默认错误信息本地化为中文', () => {
    setupZod()

    const r = z.string().safeParse(null)
    expect(r.success).toBe(false)
    if (!r.success)
      expect(r.error.issues[0]?.message).toContain('无效输入')
  })

  it('invalid_type 的类型名(含 string)完整翻译为中文', () => {
    setupZod()

    // expected: string -> 字符串(官方 locale 遗漏,此处补全)
    const r1 = z.string().safeParse(null)
    expect(r1.success).toBe(false)
    if (!r1.success)
      expect(r1.error.issues[0]?.message).toBe('无效输入：期望 字符串，实际接收 空值(null)')

    // received: 输入为 string 时也翻译为「字符串」
    const r2 = z.number().safeParse('abc')
    expect(r2.success).toBe(false)
    if (!r2.success)
      expect(r2.error.issues[0]?.message).toBe('无效输入：期望 数字，实际接收 字符串')
  })

  it('内置校验器(如 email)也显示中文', () => {
    setupZod()

    const r = z.string().email().safeParse('not-email')
    expect(r.success).toBe(false)
    if (!r.success)
      expect(r.error.issues[0]?.message).toBe('无效电子邮件')
  })

  it('字段自定义 message 优先级高于 locale,保持中文不变', () => {
    setupZod()

    const r = z.string().min(1, '商品名称不能为空').safeParse('')
    expect(r.success).toBe(false)
    if (!r.success)
      expect(r.error.issues[0]?.message).toBe('商品名称不能为空')
  })
})
