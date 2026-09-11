import { describe, expect, it } from 'vitest'

import { applyAgUiEvent, createAgUiStreamState, getAgUiDelta, getAgUiEventType } from '../ag-ui-stream'

describe('getAgUiEventType', () => {
  it('读取 type 并转成大写下划线', () => {
    expect(getAgUiEventType({ type: 'text_message_content' })).toBe('TEXT_MESSAGE_CONTENT')
  })

  it('兼容嵌在 data 里的 type', () => {
    expect(getAgUiEventType({ data: { type: 'RUN_FINISHED' } })).toBe('RUN_FINISHED')
  })
})

describe('getAgUiDelta', () => {
  it('优先读 delta', () => {
    expect(getAgUiDelta({ delta: '你好', content: '忽略' })).toBe('你好')
  })

  it('兼容 data.delta', () => {
    expect(getAgUiDelta({ data: { delta: '片段' } })).toBe('片段')
  })
})

describe('applyAgUiEvent', () => {
  it('思考过程 START/CONTENT/END 后切到正文', () => {
    let state = createAgUiStreamState()
    state = applyAgUiEvent(state, { type: 'REASONING_MESSAGE_START' }).state
    expect(state.isReasoning).toBe(true)

    state = applyAgUiEvent(state, { type: 'REASONING_MESSAGE_CONTENT', delta: '先想一步' }).state
    state = applyAgUiEvent(state, { type: 'REASONING_MESSAGE_END' }).state
    expect(state.reasoning).toBe('先想一步')
    expect(state.isReasoning).toBe(false)

    state = applyAgUiEvent(state, { type: 'TEXT_MESSAGE_CONTENT', delta: '结论：' }).state
    state = applyAgUiEvent(state, { type: 'TEXT_MESSAGE_CONTENT', delta: '可以办' }).state
    expect(state.text).toBe('结论：可以办')
    expect(state.reasoning).toBe('先想一步')
  })

  it('只有 START、没有 CONTENT 时仍保持思考态', () => {
    let state = createAgUiStreamState()
    state = applyAgUiEvent(state, { type: 'REASONING_MESSAGE_START' }).state
    state = applyAgUiEvent(state, { type: 'CUSTOM', name: 'stream_keepalive', value: { ts: '1' } }).state
    expect(state.isReasoning).toBe(true)
    expect(state.reasoning).toBe('')
  })

  it('兼容旧 THINKING_* 事件名', () => {
    let state = createAgUiStreamState()
    state = applyAgUiEvent(state, { type: 'THINKING_TEXT_MESSAGE_CONTENT', delta: '旧协议' }).state
    expect(state.reasoning).toBe('旧协议')
    expect(state.isReasoning).toBe(true)
  })

  it('rUN_FINISHED 标记本轮结束', () => {
    const result = applyAgUiEvent(createAgUiStreamState(), { type: 'RUN_FINISHED' })
    expect(result.done).toBe(true)
    expect(result.error).toBe(false)
  })

  it('rUN_ERROR 取出 message', () => {
    const result = applyAgUiEvent(createAgUiStreamState(), {
      type: 'RUN_ERROR',
      message: '模型超时',
    })
    expect(result.done).toBe(true)
    expect(result.error).toBe(true)
    expect(result.state.errorMessage).toBe('模型超时')
  })

  it('cUSTOM conversation_title 更新标题', () => {
    const result = applyAgUiEvent(createAgUiStreamState(), {
      type: 'CUSTOM',
      name: 'conversation_title',
      value: { chatId: 123, title: '开业海报' },
    })
    expect(result.state.title).toBe('开业海报')
    expect(result.state.chatId).toBe('123')
  })

  it('工具调用事件不影响正文', () => {
    let state = createAgUiStreamState()
    state = applyAgUiEvent(state, { type: 'TEXT_MESSAGE_CONTENT', delta: '正文' }).state
    state = applyAgUiEvent(state, { type: 'TOOL_CALL_START', toolCallId: 't1' }).state
    expect(state.text).toBe('正文')
  })
})
