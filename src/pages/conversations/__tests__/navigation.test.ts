import { describe, expect, it } from 'vitest'

import type { IConversation } from '@/services/api/conversation.api'

import { getConversationDetailRoute } from '../utils/navigation'

function makeConversation(type: number): IConversation {
  return {
    chatId: '123',
    skillId: 'skill-1',
    thirdId: 'third-1',
    type,
  } as IConversation
}

describe('getConversationDetailRoute', () => {
  it('returns stream route for type 1', () => {
    const item = makeConversation(1)
    expect(getConversationDetailRoute(item)).toBe(
      `/apps/stream?chatId=123&skillId=skill-1&thirdId=third-1&type=1`,
    )
  })

  it('returns stream route for type 2', () => {
    const item = makeConversation(2)
    expect(getConversationDetailRoute(item)).toBe(
      `/apps/stream?chatId=123&skillId=skill-1&thirdId=third-1&type=2`,
    )
  })

  it('returns legacy detail route for type 3', () => {
    const item = makeConversation(3)
    expect(getConversationDetailRoute(item)).toBe('/conversations/123')
  })

  it('returns legacy detail route for unknown types', () => {
    const item = makeConversation(99)
    expect(getConversationDetailRoute(item)).toBe('/conversations/123')
  })
})
