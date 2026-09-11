import { describe, expect, it } from 'vitest'

import type { IAgentScopeAgentDetail } from '@/services/api/agent-scope-agent-detail'

import { agentScopeAgentDetailPath, mapAgentScopePresentation } from '@/services/api/agent-scope-agent-detail'

function sampleDetail(overrides?: Partial<IAgentScopeAgentDetail['presentation']>): IAgentScopeAgentDetail {
  return {
    agent: {
      id: '2097261752735944706',
      agentKey: 'city-opc-gongdan',
      name: '数字员工-工单专员',
      description: '接收处理服务工单',
    },
    presentation: {
      welcomeMessage: '您好！我是工单专员。',
      avatarUrl: 'https://example.com/avatar.png',
      backgroundType: 'NONE',
      backgroundColor: '',
      backgroundUrl: '',
      recommendedQuestions: [
        { questionId: '1', questionText: '帮我写一张报修工单' },
        { questionId: '2', questionText: '  超时催办话术怎么说  ' },
        { questionId: '3', questionText: '   ' },
      ],
      ...overrides,
    },
    source: 'SNAPSHOT',
    models: [],
    skills: [],
    knowledge: [],
  }
}

describe('agentScope agent detail', () => {
  it('拼接专用详情路径', () => {
    expect(agentScopeAgentDetailPath('2097261752735944706'))
      .toBe('/agentScopeChat/agent/detail/2097261752735944706')
  })

  it('取出开场白与非空推荐问题', () => {
    expect(mapAgentScopePresentation(sampleDetail())).toEqual({
      welcomeMessage: '您好！我是工单专员。',
      recommendedQuestions: ['帮我写一张报修工单', '超时催办话术怎么说'],
    })
  })

  it('缺 presentation 时返回空开场白与空列表', () => {
    expect(mapAgentScopePresentation(null)).toEqual({
      welcomeMessage: '',
      recommendedQuestions: [],
    })
    expect(mapAgentScopePresentation(undefined)).toEqual({
      welcomeMessage: '',
      recommendedQuestions: [],
    })
  })
})
