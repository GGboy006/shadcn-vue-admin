import { HOUSEKEEPER_PROVIDER_LOCAL, HOUSEKEEPER_PROVIDER_THIRD_PARTY } from '@/services/api/housekeeper-account'

import type { HousekeeperProviderType } from './housekeeper.api'

export interface CategoryAssignmentService {
  housekeeperId: string
  providerType?: number | null
}

export interface CategoryAssignmentDraft {
  housekeeperId: string
  staffId?: string
  housekeeperName?: string
  staffName?: string
  sortOrder: number
  providerType: HousekeeperProviderType
}

export interface CategoryProviderSaveItem {
  housekeeperId: string
  staffId?: string
  sortOrder: number
}

function presentStaffId(staffId?: string | null) {
  const value = staffId?.trim()
  return value || undefined
}

/** 用启用馆列表补上网点类型。对不上时，没有师傅的行按第三方整馆处理。 */
export function resolveAssignmentProviderType(
  row: { housekeeperId: string, staffId?: string | null },
  services: CategoryAssignmentService[],
): HousekeeperProviderType {
  const found = services.find(item => item.housekeeperId === row.housekeeperId)
  if (found?.providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY)
    return HOUSEKEEPER_PROVIDER_THIRD_PARTY
  if (found?.providerType === HOUSEKEEPER_PROVIDER_LOCAL)
    return HOUSEKEEPER_PROVIDER_LOCAL
  return presentStaffId(row.staffId) ? HOUSEKEEPER_PROVIDER_LOCAL : HOUSEKEEPER_PROVIDER_THIRD_PARTY
}

export function decorateAssignment(
  row: {
    housekeeperId: string
    staffId?: string | null
    housekeeperName?: string
    staffName?: string
    sortOrder?: number
    providerType?: number | null
  },
  services: CategoryAssignmentService[],
): CategoryAssignmentDraft {
  const staffId = presentStaffId(row.staffId)
  const providerType = row.providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY || row.providerType === HOUSEKEEPER_PROVIDER_LOCAL
    ? row.providerType
    : resolveAssignmentProviderType(row, services)
  return {
    housekeeperId: row.housekeeperId,
    staffId: providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY ? undefined : staffId,
    housekeeperName: row.housekeeperName,
    staffName: row.staffName,
    sortOrder: row.sortOrder ?? 0,
    providerType,
  }
}

/** 第三方按馆去重，本地按师傅去重。 */
export function assignmentKey(row: { housekeeperId: string, staffId?: string | null, providerType?: number | null }) {
  if (row.providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY || !presentStaffId(row.staffId))
    return `house:${row.housekeeperId}`
  return `staff:${presentStaffId(row.staffId)}`
}

export function assignmentPersonLabel(row: { providerType?: number | null, staffId?: string | null, staffName?: string | null }) {
  if (row.providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY || !presentStaffId(row.staffId))
    return row.providerType === HOUSEKEEPER_PROVIDER_LOCAL ? '整馆' : '第三方 · 整馆'
  return row.staffName?.trim() || '-'
}

/** 全量覆盖。第三方不传 staffId。 */
export function buildCategoryProviderPayload(rows: CategoryAssignmentDraft[]): CategoryProviderSaveItem[] {
  return rows.map((row) => {
    const item: CategoryProviderSaveItem = {
      housekeeperId: row.housekeeperId,
      sortOrder: row.sortOrder,
    }
    if (row.providerType !== HOUSEKEEPER_PROVIDER_THIRD_PARTY && row.staffId)
      item.staffId = row.staffId
    return item
  })
}
