import { describe, expect, it } from 'vitest'

import {
  assignmentKey,
  assignmentPersonLabel,
  buildCategoryProviderPayload,
  decorateAssignment,
} from '@/services/api/housekeeper-assignment'

const services = [
  { housekeeperId: 'local-1', providerType: 1 },
  { housekeeperId: 'third-1', providerType: 2 },
]

describe('housekeeper category assignment', () => {
  it('第三方没有师傅时标成整馆，保存不带 staffId', () => {
    const row = decorateAssignment({
      housekeeperId: 'third-1',
      staffId: '',
      housekeeperName: '万师傅',
      sortOrder: 2,
    }, services)
    expect(row.providerType).toBe(2)
    expect(row.staffId).toBeUndefined()
    expect(assignmentPersonLabel(row)).toBe('第三方 · 整馆')
    expect(buildCategoryProviderPayload([row])).toEqual([
      { housekeeperId: 'third-1', sortOrder: 2 },
    ])
  })

  it('本地馆保留师傅', () => {
    const row = decorateAssignment({
      housekeeperId: 'local-1',
      staffId: 'staff-9',
      staffName: '张师傅',
      sortOrder: 1,
    }, services)
    expect(assignmentKey(row)).toBe('staff:staff-9')
    expect(assignmentPersonLabel(row)).toBe('张师傅')
    expect(buildCategoryProviderPayload([row])[0]?.staffId).toBe('staff-9')
  })

  it('同一第三方馆只占一行，本地多名师傅互不覆盖', () => {
    const third = decorateAssignment({ housekeeperId: 'third-1' }, services)
    const again = decorateAssignment({ housekeeperId: 'third-1', staffId: 'should-drop' }, services)
    const staffA = decorateAssignment({ housekeeperId: 'local-1', staffId: 'a', staffName: '甲' }, services)
    const staffB = decorateAssignment({ housekeeperId: 'local-1', staffId: 'b', staffName: '乙' }, services)
    expect(assignmentKey(third)).toBe(assignmentKey(again))
    expect(again.staffId).toBeUndefined()
    expect(assignmentKey(staffA)).not.toBe(assignmentKey(staffB))
    expect(buildCategoryProviderPayload([staffA, staffB, third])).toEqual([
      { housekeeperId: 'local-1', staffId: 'a', sortOrder: 0 },
      { housekeeperId: 'local-1', staffId: 'b', sortOrder: 0 },
      { housekeeperId: 'third-1', sortOrder: 0 },
    ])
  })

  it('启用列表还没回来时，空 staffId 不当成本地师傅', () => {
    const row = decorateAssignment({ housekeeperId: 'unknown', staffId: null }, [])
    expect(row.providerType).toBe(2)
    expect(assignmentPersonLabel(row)).toBe('第三方 · 整馆')
  })
})
