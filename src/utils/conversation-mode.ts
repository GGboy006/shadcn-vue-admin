/** 服务模式：0-AI托管 1-人工接管 2-待人工介入 7-居民 AI 助手 9-数字员工 */
export type ServiceMode = 0 | 1 | 2 | 7 | 9

/** 会话/技能类型：1=扣子(Coze) 2=Agent 3=AI AgentSkill */
export type ConversationType = 1 | 2 | 3

export interface ConversationModeBadge {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'info'
}

/** 服务模式映射配置 */
export const serviceModeConfig: Record<ServiceMode, ConversationModeBadge> = {
  0: { label: 'AI托管', variant: 'default' },
  1: { label: '人工接管', variant: 'secondary' },
  2: { label: '待人工介入', variant: 'destructive' },
  7: { label: '居民 AI 助手', variant: 'info' },
  9: { label: '数字员工', variant: 'info' },
}

/** 会话类型映射配置 */
export const conversationTypeConfig: Record<ConversationType, ConversationModeBadge> = {
  1: { label: '扣子', variant: 'secondary' },
  2: { label: 'Agent', variant: 'info' },
  3: { label: 'AI AgentSkill', variant: 'info' },
}

const unknownModeBadge: ConversationModeBadge = { label: '未知', variant: 'secondary' }

/**
 * 工作台/列表上的模式徽章。
 * 已知服务模式优先；对不上时回退到会话类型（扣子 / Agent / AI AgentSkill）。
 */
export function getConversationModeDisplay(
  serviceMode: number | undefined,
  type?: number,
): ConversationModeBadge {
  if (serviceMode != null && Object.hasOwn(serviceModeConfig, serviceMode))
    return serviceModeConfig[serviceMode as ServiceMode]
  if (type != null && Object.hasOwn(conversationTypeConfig, type))
    return conversationTypeConfig[type as ConversationType]
  return unknownModeBadge
}
