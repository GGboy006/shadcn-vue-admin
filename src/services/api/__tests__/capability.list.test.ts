import { describe, expect, it } from 'vitest'

import { filterCapabilityList, normalizeCapability, normalizeCapabilityList } from '@/services/api/capability.list'
import { MOCK_CAPABILITIES } from '@/services/api/capability.mock'

describe('capability list helpers', () => {
  it('coerces capabilityId to string and fills arrays', () => {
    const item = normalizeCapability({
      capabilityId: 1 as unknown as string,
      capabilityCode: 'flyai',
      capabilityName: '飞猪酒旅',
      accessType: '2' as unknown as 2,
      category: 'travel',
    })
    expect(item.capabilityId).toBe('1')
    expect(item.accessType).toBe(2)
    expect(item.tags).toEqual([])
    expect(item.samplePrompts).toEqual([])
  })

  it('filters MCP only', () => {
    const list = filterCapabilityList(MOCK_CAPABILITIES, { accessType: 1 })
    expect(list.length).toBe(5)
    expect(list.every(item => item.accessType === 1)).toBe(true)
  })

  it('filters by category', () => {
    const list = filterCapabilityList(MOCK_CAPABILITIES, { category: 'travel' })
    expect(list.map(item => item.capabilityCode)).toEqual(['flyai'])
  })

  it('sorts by sortOrder then id', () => {
    const list = filterCapabilityList(MOCK_CAPABILITIES)
    expect(list.map(item => item.capabilityCode)).toEqual([
      'flyai',
      'owner-ai-assistant',
      'moji_weather',
      'oil_price',
      'uu_errand',
      'mcdonalds',
      'kuaidi100',
    ])
  })

  it('web seed has no remark or status', () => {
    for (const item of normalizeCapabilityList(MOCK_CAPABILITIES)) {
      expect(item).not.toHaveProperty('remark')
      expect(item).not.toHaveProperty('status')
    }
  })
})
