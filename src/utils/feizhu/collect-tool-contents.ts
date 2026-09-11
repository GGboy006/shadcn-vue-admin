import type { IChatMessage, IToolCall } from '@/services/api/conversation.api'

const SKIPPED_TOOL = /read_file|load_skill|读取文件|技能加载/i

export function isSkippedToolName(name?: string | null): boolean {
  return !!name && SKIPPED_TOOL.test(name)
}

function isSkippedTool(tool?: IToolCall | null): boolean {
  return isSkippedToolName(tool?.toolName) || isSkippedToolName(tool?.display)
}

/** 收集一条消息里可用于飞猪出卡的工具结果（跳过 read_file / load_skill） */
export function collectToolContentsFromMessage(msg: IChatMessage): unknown[] {
  const contents: unknown[] = []
  const seen = new Set<string>()

  function push(raw?: string | null) {
    if (!raw || seen.has(raw))
      return
    seen.add(raw)
    contents.push(raw)
  }

  for (const part of msg.parts ?? []) {
    if (part.type === 'tool_call' && part.toolCall && !isSkippedTool(part.toolCall))
      push(part.toolCall.result)
    if ((part.type === 'tool_result' || part.type === 'tool') && !isSkippedToolName(part.toolCall?.toolName)) {
      push(part.content)
      push(part.toolCall?.result)
    }
  }

  for (const tool of msg.toolCalls ?? []) {
    if (!isSkippedTool(tool))
      push(tool.result)
  }

  const role = (msg.role ?? '').toLowerCase()
  if (role === 'tool' || role === 'tool_result') {
    push(msg.content)
    push(msg.finalContent)
  }

  return contents
}
