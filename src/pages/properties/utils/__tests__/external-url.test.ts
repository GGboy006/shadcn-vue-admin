import { describe, expect, it } from 'vitest'

import { resolveExternalUrl } from '../external-url'

describe('resolveExternalUrl', () => {
  it('已带 https 协议时原样返回', () => {
    expect(resolveExternalUrl('https://example.com/a?b=1')).toBe('https://example.com/a?b=1')
  })

  it('已带 http 协议时原样返回', () => {
    expect(resolveExternalUrl('http://example.com')).toBe('http://example.com')
  })

  it('协议大小写混写也能识别', () => {
    expect(resolveExternalUrl('HTTPS://example.com')).toBe('HTTPS://example.com')
  })

  it('缺协议时补 https,避免被当成站内相对路径', () => {
    expect(resolveExternalUrl('example.com/path')).toBe('https://example.com/path')
  })

  it('首尾空格会被去掉', () => {
    expect(resolveExternalUrl('  https://example.com  ')).toBe('https://example.com')
  })

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['空字符串', ''],
    ['纯空格', '   '],
  ])('%s 时返回 undefined', (_, input) => {
    expect(resolveExternalUrl(input)).toBeUndefined()
  })

  it.each([
    ['javascript 协议', 'javascript:alert(1)'],
    ['data 协议', 'data:text/html,<script>alert(1)</script>'],
    ['大小写绕过的 javascript 协议', 'JaVaScRiPt:alert(1)'],
  ])('%s 被拦截', (_, input) => {
    expect(resolveExternalUrl(input)).toBeUndefined()
  })
})
