import { describe, expect, it } from 'vitest'

import { normalizeImageGenerationPoll, parseImageGenerationArtifact } from '../image-generation-card'

const artifact = {
  artifactId: 'card_publish_card_imagegeneration_211',
  artifactType: 'card',
  title: '中秋节假期氛围海报',
  summary: '海报生成中，比例 3:4',
  payload: {
    title: '中秋节假期氛围海报',
    body: '{"imageGenerationId": "211", "status": 0, "size": "3:4", "chatId": 2101607224827756546}',
    summary: '海报生成中，比例 3:4',
    bizType: 'imageGeneration',
    bizId: '211',
    tags: ['imageGeneration', '3:4'],
    actions: [{ label: '查看海报', action: 'pollImage', target: '/aiImage/generations/211' }],
  },
}

describe('parseImageGenerationArtifact', () => {
  it('从对话流卡片抽出轮询地址', () => {
    const card = parseImageGenerationArtifact(artifact)
    expect(card).toMatchObject({
      title: '中秋节假期氛围海报',
      summary: '海报生成中，比例 3:4',
      imageGenerationId: '211',
      size: '3:4',
      pollTarget: '/aiImage/generations/211',
      actionLabel: '查看海报',
    })
  })

  it('忽略非生图卡片，并拒绝卡片上的任意地址', () => {
    expect(parseImageGenerationArtifact({ artifactType: 'card', payload: { bizType: 'train' } })).toBeNull()
    const card = parseImageGenerationArtifact({
      ...artifact,
      payload: {
        ...artifact.payload,
        actions: [{ label: '查看海报', action: 'pollImage', target: 'https://evil.example/steal' }],
      },
    })
    expect(card?.pollTarget).toBe('/aiImage/generations/211')
  })
})

describe('normalizeImageGenerationPoll', () => {
  it('读取 data 里的状态和图片地址', () => {
    expect(normalizeImageGenerationPoll({
      code: 0,
      data: { status: '1', imageUrl: 'https://cdn.example/poster.png', size: '3:4' },
    }, '1:1')).toEqual({
      status: 1,
      imageUrl: 'https://cdn.example/poster.png',
      size: '3:4',
    })
  })

  it('没有状态时视为仍在生成', () => {
    expect(normalizeImageGenerationPoll({}, '3:4')).toEqual({
      status: 0,
      imageUrl: '',
      size: '3:4',
    })
  })
})
