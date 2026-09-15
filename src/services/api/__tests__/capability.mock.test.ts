import { describe, expect, it } from 'vitest'

import { mockCapabilityDetail, mockCapabilityList } from '@/services/api/capability.mock'

describe('capability mock', () => {
  it('returns seven seed capabilities', async () => {
    const res = await mockCapabilityList()
    expect(res.data).toHaveLength(7)
  })

  it('filters skill list', async () => {
    const res = await mockCapabilityList({ accessType: 2 })
    expect(res.data.map(item => item.capabilityCode)).toEqual(['flyai', 'owner-ai-assistant'])
  })

  it('returns detail by id', async () => {
    const res = await mockCapabilityDetail('3')
    expect(res.data.capabilityCode).toBe('moji_weather')
  })

  it('throws when capability is missing', async () => {
    await expect(mockCapabilityDetail('missing')).rejects.toThrow('能力不存在')
  })
})
