import { describe, expect, it } from 'vitest'

import { mergeStreamText } from '@/utils/stream-text'

describe('mergeStreamText', () => {
  it('增量分片时追加到已有文本', () => {
    let content = ''
    content = mergeStreamText(content, '结论：')
    content = mergeStreamText(content, '稳住现金流')
    expect(content).toBe('结论：稳住现金流')
  })

  it('fullFlag=true 时用全量快照覆盖，避免内容重复', () => {
    let content = ''
    content = mergeStreamText(content, '结论：稳住现金流', true)
    content = mergeStreamText(content, '结论：稳住现金流，盯紧3个关键动作', true)
    expect(content).toBe('结论：稳住现金流，盯紧3个关键动作')
  })

  it('兼容 fullFlag 被序列化成字符串 true', () => {
    expect(mergeStreamText('旧内容', '全量内容', 'true')).toBe('全量内容')
  })

  it('fullFlag 为假值时按增量处理', () => {
    expect(mergeStreamText('abc', 'd', false)).toBe('abcd')
    expect(mergeStreamText('abc', 'd', 'false')).toBe('abcd')
    expect(mergeStreamText('abc', 'd', null)).toBe('abcd')
    expect(mergeStreamText('abc', 'd')).toBe('abcd')
  })

  it('增量在前、末帧全量时以末帧为准', () => {
    let content = ''
    content = mergeStreamText(content, '结论：')
    content = mergeStreamText(content, '稳住')
    content = mergeStreamText(content, '结论：稳住现金流', true)
    expect(content).toBe('结论：稳住现金流')
  })

  it('空分片不改变已有文本', () => {
    expect(mergeStreamText('abc', '')).toBe('abc')
    expect(mergeStreamText('abc', undefined)).toBe('abc')
    expect(mergeStreamText('abc', null, true)).toBe('abc')
  })
})
