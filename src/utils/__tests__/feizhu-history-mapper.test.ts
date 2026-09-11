import { describe, expect, it } from 'vitest'

import type { IChatMessage } from '@/services/api/conversation.api'

import { mapFlyCardsByMessageId } from '../feizhu/history-mapper'
import { ingestFlyCards } from '../feizhu/ingest'
import { normalizeChatMarkdown } from '../feizhu/normalize-markdown'
import { recoverFlyCardsFromMarkdown } from '../feizhu/parse-markdown'

function message(overrides: Partial<IChatMessage> = {}): IChatMessage {
  return {
    id: '1',
    chatId: 'c1',
    role: 'assistant',
    content: '',
    finalContent: '',
    parts: [],
    attachments: [],
    createTime: '2026-09-07T10:00:00',
    reasoningSegments: [],
    imageGenerationId: '',
    steps: null,
    ...overrides,
  }
}

const hotelA = {
  name: '如家旗下-北京北京站同仁医院派柏·云酒店',
  shId: 'h1',
  star: '舒适型',
  scoreDesc: '4.0',
  address: '东城区崇文门东兴隆街',
  interestsPoi: '近天安门广场',
  mainPic: 'https://img.example.com/a.jpg',
  price: '171',
  detailUrl: 'https://router.feizhu.com/ws/a',
}

const hotelB = {
  name: '康福瑞酒店',
  shId: 'h2',
  star: '舒适型',
  scoreDesc: '3.0',
  address: '西城区牛街14号',
  interestsPoi: '近牛街(地铁站)',
  price: '474',
  detailUrl: 'https://router.feizhu.com/ws/b',
}

const trainItem = {
  trainNo: 'G123',
  transportName: '复兴号',
  seatClass: '二等座',
  journeys: [
    { depTime: '08:00', arrTime: '10:30', depStation: '北京南站', arrStation: '南京南站', trainNo: 'G123' },
  ],
  durationText: '2小时30分',
  dateText: '9月10日 周三',
  price: '553',
  jumpUrl: 'https://www.fliggy.com/train/g123',
}

describe('ingestFlyCards', () => {
  it('parses hotel itemList from execute command output', () => {
    const raw = `Exit code: 0\n\n${JSON.stringify({ data: { itemList: [hotelA, hotelB] } })}`
    const cards = ingestFlyCards(raw)
    expect(cards.hotels.map(item => item.name)).toEqual([hotelA.name, hotelB.name])
    expect(cards.hotels[0].priceText).toBe('¥171/晚')
    expect(cards.hotels[0].poiHint).toBe('近天安门广场')
    expect(cards.hotels[0].jumpUrl).toContain('feizhu')
    expect(cards.trains).toEqual([])
    expect(cards.pois).toEqual([])
  })

  it('parses train items with journeys and does not treat them as hotels', () => {
    const cards = ingestFlyCards({ items: [trainItem] })
    expect(cards.trains).toHaveLength(1)
    expect(cards.trains[0].depStation).toBe('北京南')
    expect(cards.trains[0].journeyType).toBe('直达')
    expect(cards.hotels).toEqual([])
  })
})

describe('mapFlyCardsByMessageId', () => {
  it('merges hotels in the same turn under assistant text', () => {
    const user = message({ id: 'u1', role: 'user', content: '推荐附近酒店', parts: [{ type: 'text', content: '推荐附近酒店' }] })
    const assistant = message({
      id: 'a1',
      role: 'assistant',
      createTime: '2026-09-07T10:01:00',
      content: '以下是推荐',
      parts: [
        {
          type: 'tool_call',
          toolCall: {
            toolName: 'execute',
            result: JSON.stringify({ data: { itemList: [hotelA, hotelB] } }),
          },
        },
        { type: 'text', content: '以下是为您推荐的北京附近酒店' },
      ],
    })

    const map = mapFlyCardsByMessageId([user, assistant])
    const cards = map.get('a1')
    expect(cards?.hotels).toHaveLength(2)
    expect(cards?.hotels.map(item => item.jumpUrl)).toEqual([
      'https://router.feizhu.com/ws/a',
      'https://router.feizhu.com/ws/b',
    ])
  })

  it('dedupes the same jumpUrl within a turn but allows it in the next turn', () => {
    const turn1User = message({ id: 'u1', role: 'user', content: '酒店', parts: [{ type: 'text', content: '酒店' }] })
    const turn1Ai = message({
      id: 'a1',
      createTime: '2026-09-07T10:01:00',
      parts: [
        { type: 'tool_call', toolCall: { toolName: 'execute', result: JSON.stringify({ itemList: [hotelA, hotelA] }) } },
        { type: 'text', content: '第一轮' },
      ],
    })
    const turn2User = message({
      id: 'u2',
      role: 'user',
      createTime: '2026-09-07T10:02:00',
      content: '再看看',
      parts: [{ type: 'text', content: '再看看' }],
    })
    const turn2Ai = message({
      id: 'a2',
      createTime: '2026-09-07T10:03:00',
      parts: [
        { type: 'tool_call', toolCall: { toolName: 'execute', result: JSON.stringify({ itemList: [hotelA] }) } },
        { type: 'text', content: '第二轮' },
      ],
    })

    const map = mapFlyCardsByMessageId([turn1User, turn1Ai, turn2User, turn2Ai])
    expect(map.get('a1')?.hotels).toHaveLength(1)
    expect(map.get('a2')?.hotels).toHaveLength(1)
    expect(map.get('a2')?.hotels[0].jumpUrl).toBe(hotelA.detailUrl)
  })

  it('keeps multiple train cards instead of merging them', () => {
    const otherTrain = {
      ...trainItem,
      trainNo: 'G456',
      journeys: [{ ...trainItem.journeys[0], trainNo: 'G456' }],
      jumpUrl: 'https://www.fliggy.com/train/g456',
    }
    const assistant = message({
      id: 'a1',
      parts: [
        { type: 'tool_call', toolCall: { toolName: 'search-train', result: JSON.stringify({ items: [trainItem, otherTrain] }) } },
        { type: 'text', content: '车次如下' },
      ],
    })

    const cards = mapFlyCardsByMessageId([
      message({ id: 'u1', role: 'user', content: '火车票', parts: [{ type: 'text', content: '火车票' }] }),
      assistant,
    ]).get('a1')

    expect(cards?.trains.map(item => item.trainNo)).toEqual(['G123', 'G456'])
  })

  it('recovers hotels from markdown only when the turn has no fly cards', () => {
    const md = '### 1. 如家酒店\n💰 ¥171/晚\n[Click to book](https://router.feizhu.com/ws/md)'
    const noTool = message({
      id: 'a1',
      parts: [{ type: 'text', content: md }],
    })
    const withTool = message({
      id: 'a2',
      createTime: '2026-09-07T11:00:00',
      parts: [
        { type: 'tool_call', toolCall: { toolName: 'execute', result: JSON.stringify({ itemList: [hotelA] }) } },
        { type: 'text', content: md },
      ],
    })

    const recovered = mapFlyCardsByMessageId([
      message({ id: 'u1', role: 'user', parts: [{ type: 'text', content: '酒店' }] }),
      noTool,
    ]).get('a1')
    expect(recovered?.hotels).toHaveLength(1)
    expect(recovered?.hotels[0].name).toBe('如家酒店')

    const ignored = mapFlyCardsByMessageId([
      message({ id: 'u2', role: 'user', createTime: '2026-09-07T10:59:00', parts: [{ type: 'text', content: '酒店' }] }),
      withTool,
    ]).get('a2')
    expect(ignored?.hotels).toHaveLength(1)
    expect(ignored?.hotels[0].jumpUrl).toBe(hotelA.detailUrl)
  })

  it('skips load_skill and read_file tool results', () => {
    const assistant = message({
      id: 'a1',
      parts: [
        { type: 'tool_call', toolCall: { toolName: 'load_skill', result: JSON.stringify({ itemList: [hotelA] }) } },
        { type: 'text', content: '好的' },
      ],
    })
    expect(mapFlyCardsByMessageId([assistant]).get('a1')).toBeUndefined()
  })
})

describe('recoverFlyCardsFromMarkdown', () => {
  it('extracts Click to book hotel cards', () => {
    const cards = recoverFlyCardsFromMarkdown('### 1. 如家酒店\n[Click to book](https://router.feizhu.com/ws/x)')
    expect(cards.hotels[0].name).toBe('如家酒店')
  })
})

describe('normalizeChatMarkdown', () => {
  it('downgrades headings and strips extra separators', () => {
    const out = normalizeChatMarkdown('# 标题\n---\n---\n### 预订链接\n\n正文')
    expect(out).not.toMatch(/^# /m)
    expect(out).toContain('### 标题')
    expect(out).not.toContain('预订链接')
    expect(out).not.toContain('---')
  })
})
