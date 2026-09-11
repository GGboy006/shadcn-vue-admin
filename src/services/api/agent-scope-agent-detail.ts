/**
 * AgentScope 智能体运行配置（aiType=3）的纯类型与映射。
 * 独立成模块，避免 api 文件导入 useApiFetch 污染纯函数测试。
 */

export interface IAgentScopeAgentInfo {
  id: string
  agentKey: string
  name: string
  description: string
}

export interface IAgentScopeRecommendedQuestion {
  questionId: string
  questionText: string
}

export interface IAgentScopePresentation {
  welcomeMessage: string
  avatarUrl: string
  backgroundType: string
  backgroundColor: string
  backgroundUrl: string
  recommendedQuestions: IAgentScopeRecommendedQuestion[]
}

export interface IAgentScopeModel {
  modelProfileId: string
  role: string
  provider: string
  model: string
  priority: number
}

/** AgentScope 智能体运行配置详情 */
export interface IAgentScopeAgentDetail {
  agent: IAgentScopeAgentInfo
  presentation: IAgentScopePresentation
  source: string
  models: IAgentScopeModel[]
  skills: unknown[]
  knowledge: unknown[]
}

export function agentScopeAgentDetailPath(agentId: string) {
  return `/agentScopeChat/agent/detail/${agentId}`
}

/** 开场白 + 推荐问题：只取 presentation 里对话需要的字段 */
export function mapAgentScopePresentation(detail?: IAgentScopeAgentDetail | null) {
  const welcomeMessage = detail?.presentation?.welcomeMessage?.trim() ?? ''
  const recommendedQuestions = (detail?.presentation?.recommendedQuestions ?? [])
    .map(item => item.questionText?.trim() ?? '')
    .filter(text => text.length > 0)
  return { welcomeMessage, recommendedQuestions }
}
