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

  it('cUSTOM artifact 收集生图卡片，同一 id 不重复', () => {
    const artifact = {
      type: 'CUSTOM',
      name: 'artifact',
      value: {
        artifactId: 'card_211',
        artifactType: 'card',
        title: '中秋节假期氛围海报',
        summary: '海报生成中，比例 3:4',
        payload: {
          title: '中秋节假期氛围海报',
          body: JSON.stringify({ imageGenerationId: '211', status: 0, size: '3:4' }),
          summary: '海报生成中，比例 3:4',
          bizType: 'imageGeneration',
          bizId: '211',
          actions: [{ label: '查看海报', action: 'pollImage', target: '/aiImage/generations/211' }],
        },
      },
    }
    let state = applyAgUiEvent(createAgUiStreamState(), artifact).state
    state = applyAgUiEvent(state, artifact).state
    expect(state.imageCards).toHaveLength(1)
    expect(state.imageCards[0]?.imageGenerationId).toBe('211')
    expect(state.imageCards[0]?.pollTarget).toBe('/aiImage/generations/211')
    expect(state.imageCards[0]?.size).toBe('3:4')
  })

  it('工具调用事件不影响正文', () => {
    let state = createAgUiStreamState()
    state = applyAgUiEvent(state, { type: 'TEXT_MESSAGE_CONTENT', delta: '正文' }).state
    state = applyAgUiEvent(state, { type: 'TOOL_CALL_START', toolCallId: 't1' }).state
    expect(state.text).toBe('正文')
    expect(state.toolCalls).toHaveLength(1)
  })

  it('工具步骤用展示名，脱敏参数不进入正文', () => {
    let state = createAgUiStreamState()
    state = applyAgUiEvent(state, {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'call_skill',
      delta: '',
      toolCallName: 'load_skill_through_path',
      toolDisplayName: '技能加载',
      redacted: true,
    }).state
    state = applyAgUiEvent(state, {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'call_exec',
      delta: '印',
      toolCallName: 'execute',
      toolDisplayName: '执行命令',
    }).state
    state = applyAgUiEvent(state, {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'call_exec',
      delta: '脏',
      toolCallName: 'execute',
      toolDisplayName: '执行命令',
    }).state

    expect(state.text).toBe('')
    expect(state.isReasoning).toBe(false)
    expect(state.toolCalls.map(call => call.display)).toEqual(['技能加载', '执行命令'])
    expect(state.toolCalls[0]?.arguments).toContain('redacted')
    expect(state.toolCalls[1]).toMatchObject({ arguments: '印脏', status: 'running' })

    state = applyAgUiEvent(state, { type: 'TEXT_MESSAGE_CONTENT', delta: '已提交' }).state
    expect(state.text).toBe('已提交')
    expect(state.toolCalls.every(call => call.status === 'completed')).toBe(true)
  })
})
