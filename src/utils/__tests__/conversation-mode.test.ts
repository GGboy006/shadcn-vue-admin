import { describe, expect, it } from 'vitest'

import { getConversationModeDisplay } from '../conversation-mode'

describe('getConversationModeDisplay', () => {
  it('uses known serviceMode first', () => {
    expect(getConversationModeDisplay(0, 3).label).toBe('AI托管')
    expect(getConversationModeDisplay(1, 1).label).toBe('人工接管')
    expect(getConversationModeDisplay(9, 2).label).toBe('数字员工')
    expect(getConversationModeDisplay(7, 3).label).toBe('居民 AI 助手')
  })

  it('falls back to type when serviceMode is unmapped', () => {
    expect(getConversationModeDisplay(8, 3).label).toBe('AI AgentSkill')
    expect(getConversationModeDisplay(undefined, 1).label).toBe('扣子')
    expect(getConversationModeDisplay(undefined, 2).label).toBe('Agent')
  })

  it('returns 未知 when neither mode nor type is mapped', () => {
    expect(getConversationModeDisplay(8, 99).label).toBe('未知')
    expect(getConversationModeDisplay(undefined, undefined).label).toBe('未知')
  })
})
