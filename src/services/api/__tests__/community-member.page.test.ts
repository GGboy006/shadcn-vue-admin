import { describe, expect, it } from 'vitest'

import { normalizeMemberPage } from '@/services/api/community-member.page'

describe('normalizeMemberPage', () => {
  it('coerces string page fields', () => {
    const page = normalizeMemberPage({
      pageNum: '1',
      pageSize: '10',
      total: '3',
      pages: '1',
      emptyFlag: false,
      list: [{ uniqueCode: 'a' }],
    })

    expect(page.pageNum).toBe(1)
    expect(page.pageSize).toBe(10)
    expect(page.total).toBe(3)
    expect(page.pages).toBe(1)
    expect(page.list).toHaveLength(1)
  })

  it('maps list items and treats missing list as empty', () => {
    const mapped = normalizeMemberPage(
      { list: [{ uniqueCode: 1 as unknown as string }] },
      item => ({ uniqueCode: String(item.uniqueCode) }),
    )
    expect(mapped.list[0].uniqueCode).toBe('1')

    const empty = normalizeMemberPage(null)
    expect(empty.list).toEqual([])
    expect(empty.total).toBe(0)
    expect(empty.emptyFlag).toBe(true)
  })
})
