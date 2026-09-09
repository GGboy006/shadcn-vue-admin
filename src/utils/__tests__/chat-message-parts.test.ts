import { describe, expect, it } from 'vitest'

import type { IChatMessage } from '@/services/api/conversation.api'

import {
  applyPartsToMessage,
  formatDurationMs,
  formatToolPreview,
  getMessageReasoning,
  getMessageText,
  hasAssistantVisualContent,
  hydrateChatMessage,
  parseToolPayload,
  toAiToolState,
  toAiToolView,
  toMessageAlign,
  toMessageUiFrom,
  visibleChatMessages,
} from '../chat-message-parts'

function emptyMessage(overrides: Partial<IChatMessage> = {}): IChatMessage {
  return {
    id: '1',
    chatId: '2',
    role: 'assistant',
    content: '',
    finalContent: '',
    parts: [],
    attachments: [],
    createTime: '',
    reasoningSegments: [],
    imageGenerationId: '',
    steps: null,
    ...overrides,
  }
}

describe('applyPartsToMessage', () => {
  it('思考在前、正文在后写入 parts', () => {
    const msg = emptyMessage()
    applyPartsToMessage(msg, { reasoning: '想一下', text: '答案' })
    expect(msg.parts.map(p => p.type)).toEqual(['reasoning', 'text'])
    expect(getMessageReasoning(msg)).toBe('想一下')
    expect(getMessageText(msg)).toBe('答案')
    expect(msg.content).toBe('答案')
  })
})

describe('hydrateChatMessage', () => {
  it('已有 parts 时不再用 content 覆盖', () => {
    const msg = hydrateChatMessage(emptyMessage({
      content: '旧字段',
      parts: [{ type: 'text', content: '结构化正文' }],
    }))
    expect(getMessageText(msg)).toBe('结构化正文')
  })

  it('loongAI 历史只有 reasoningSegments 时补齐 parts', () => {
    const msg = hydrateChatMessage(emptyMessage({
      content: '结论',
      reasoningSegments: [{ messageId: '1', content: '推理' }],
    }))
    expect(getMessageReasoning(msg)).toBe('推理')
    expect(getMessageText(msg)).toBe('结论')
  })

  it('把后端数字 ID 转成字符串', () => {
    const msg = hydrateChatMessage(emptyMessage({
      chatId: 123 as unknown as string,
    }))
    expect(msg.chatId).toBe('123')
  })

  it('已有 tool_call parts 时原样保留', () => {
    const msg = hydrateChatMessage(emptyMessage({
      content: '酒店推荐',
      parts: [
        {
          type: 'tool_call',
          content: null,
          duration: '587',
          toolCall: {
            toolName: '技能加载',
            arguments: '{"redacted":true,"reason":"sensitive_tool_payload"}',
            result: '{"redacted":true,"reason":"sensitive_tool_payload"}',
            duration: '587',
          },
        },
        { type: 'text', content: '酒店推荐' },
      ],
    }))
    expect(msg.parts.map(p => p.type)).toEqual(['tool_call', 'text'])
    expect(hasAssistantVisualContent(msg)).toBe(true)
  })
})

describe('visibleChatMessages', () => {
  it('过滤独立的 tool_call / tool_result 气泡', () => {
    const visible = visibleChatMessages([
      emptyMessage({ id: 'u', role: 'user', content: '推荐附近酒店' }),
      emptyMessage({ id: 'tc', role: 'tool_call', content: 'execute' }),
      emptyMessage({ id: 'tr', role: 'tool_result', content: '{"data":{}}' }),
      emptyMessage({ id: 'a', role: 'assistant', content: '酒店推荐' }),
    ])
    expect(visible.map(m => m.role)).toEqual(['user', 'assistant'])
  })
})

describe('formatDurationMs / formatToolPreview', () => {
  it('把字符串毫秒格式化成秒', () => {
    expect(formatDurationMs('587')).toBe('587ms')
    expect(formatDurationMs('6639')).toBe('6.6秒')
  })

  it('敏感 payload 不展开原文', () => {
    expect(formatToolPreview('{"redacted":true,"reason":"sensitive_tool_payload"}'))
      .toBe('敏感内容已隐藏')
  })

  it('超长结果截断', () => {
    const preview = formatToolPreview(JSON.stringify({ data: 'x'.repeat(500) }), 40)
    expect(preview.endsWith('…')).toBe(true)
    expect(preview.length).toBeLessThanOrEqual(41)
  })
})

describe('toMessageUiFrom / toMessageAlign', () => {
  it('站长工作台：用户在左、助手在右', () => {
    expect(toMessageUiFrom('user')).toBe('user')
    expect(toMessageAlign('user', 'left')).toBe('start')
    expect(toMessageAlign('assistant', 'left')).toBe('end')
    expect(toMessageAlign('station_master', 'left')).toBe('end')
  })

  it('数字员工：用户在右、助手在左', () => {
    expect(toMessageAlign('user', 'right')).toBe('end')
    expect(toMessageAlign('assistant', 'right')).toBe('start')
  })
})

describe('toAiToolView', () => {
  it('completed + 字符串 duration 映射为已完成', () => {
    const view = toAiToolView({
      type: 'tool_call',
      content: null,
      duration: '587',
      toolCall: {
        toolName: '技能加载',
        status: 'completed',
        arguments: '{"redacted":true,"reason":"sensitive_tool_payload"}',
        result: '{"redacted":true,"reason":"sensitive_tool_payload"}',
        duration: '587',
      },
    })
    expect(view?.state).toBe('output-available')
    expect(view?.title).toContain('技能加载')
    expect(view?.input).toEqual({ redacted: true, message: '敏感内容已隐藏' })
  })

  it('error 映射为失败', () => {
    expect(toAiToolState({ status: 'completed', error: 'boom' })).toBe('output-error')
  })

  it('parseToolPayload 截断超长 JSON', () => {
    const parsed = parseToolPayload(JSON.stringify({ data: 'x'.repeat(2000) }), 40)
    expect(typeof parsed).toBe('string')
    expect(String(parsed).endsWith('…')).toBe(true)
  })
})
