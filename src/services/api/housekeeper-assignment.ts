import { HOUSEKEEPER_PROVIDER_LOCAL, HOUSEKEEPER_PROVIDER_THIRD_PARTY } from '@/services/api/housekeeper-account'

import type { HousekeeperProviderType } from './housekeeper.api'

export interface CategoryAssignmentService {
  housekeeperId: string
  providerType?: number | null
}

export interface CategoryAssignmentDraft {
  housekeeperId: string
  staffId?: string
  /** 合作方人员。只有 PARTNER 渠道可带，空表示整馆 */
  partnerStaffId?: string
  housekeeperName?: string
  staffName?: string
  sortOrder: number
  providerType: HousekeeperProviderType
  /** 第三方渠道接入方式，保存时不提交 */
  integrationMode?: string
}

export interface CategoryProviderSaveItem {
  housekeeperId: string
  staffId?: string
  partnerStaffId?: string
  sortOrder: number
}

function presentId(id?: string | number | null) {
  if (id == null)
    return undefined
  const value = String(id).trim()
  return value || undefined
}

/** 用启用馆列表补上网点类型。对不上时，没有师傅的行按第三方整馆处理。 */
export function resolveAssignmentProviderType(
  row: { housekeeperId: string, staffId?: string | number | null, partnerStaffId?: string | number | null },
  services: CategoryAssignmentService[],
): HousekeeperProviderType {
  const found = services.find(item => item.housekeeperId === row.housekeeperId)
  if (found?.providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY)
    return HOUSEKEEPER_PROVIDER_THIRD_PARTY
  if (presentId(row.partnerStaffId))
    return HOUSEKEEPER_PROVIDER_THIRD_PARTY
  if (found?.providerType === HOUSEKEEPER_PROVIDER_LOCAL)
    return HOUSEKEEPER_PROVIDER_LOCAL
  return presentId(row.staffId) ? HOUSEKEEPER_PROVIDER_LOCAL : HOUSEKEEPER_PROVIDER_THIRD_PARTY
}

export function decorateAssignment(
  row: {
    housekeeperId: string
    staffId?: string | number | null
    partnerStaffId?: string | number | null
    housekeeperName?: string
    staffName?: string
    sortOrder?: number
    providerType?: number | null
    integrationMode?: string
  },
  services: CategoryAssignmentService[],
): CategoryAssignmentDraft {
  const staffId = presentId(row.staffId)
  const partnerStaffId = presentId(row.partnerStaffId)
  const explicitType = row.providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY || row.providerType === HOUSEKEEPER_PROVIDER_LOCAL
    ? row.providerType
    : undefined
  const providerType = partnerStaffId
    ? HOUSEKEEPER_PROVIDER_THIRD_PARTY
    : (explicitType ?? resolveAssignmentProviderType(row, services))
  return {
    housekeeperId: String(row.housekeeperId),
    staffId: providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY ? undefined : staffId,
    partnerStaffId: providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY ? partnerStaffId : undefined,
    housekeeperName: row.housekeeperName,
    staffName: row.staffName,
    sortOrder: row.sortOrder ?? 0,
    providerType,
    integrationMode: row.integrationMode,
  }
}

/** 合作方按馆加人去重，其它第三方按馆去重，本地按师傅去重。 */
export function assignmentKey(row: {
  housekeeperId: string
  staffId?: string | number | null
  partnerStaffId?: string | number | null
  providerType?: number | null
}) {
  const partnerStaffId = presentId(row.partnerStaffId)
  if (partnerStaffId)
    return `partner:${row.housekeeperId}:${partnerStaffId}`
  if (row.providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY || !presentId(row.staffId))
    return `house:${row.housekeeperId}`
  return `staff:${presentId(row.staffId)}`
}

export function assignmentPersonLabel(row: {
  providerType?: number | null
  staffId?: string | number | null
  partnerStaffId?: string | number | null
  staffName?: string | null
  integrationMode?: string | null
}) {
  if (presentId(row.partnerStaffId))
    return row.staffName?.trim() || '-'
  if (row.providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY || !presentId(row.staffId)) {
    if (row.providerType === HOUSEKEEPER_PROVIDER_LOCAL)
      return '整馆'
    if (row.integrationMode === 'PARTNER')
      return '合作方 · 整馆'
    return '第三方 · 整馆'
  }
  return row.staffName?.trim() || '-'
}

/** 全量覆盖。本地传 staffId，合作方到人传 partnerStaffId，整馆两个都不传。 */
export function buildCategoryProviderPayload(rows: CategoryAssignmentDraft[]): CategoryProviderSaveItem[] {
  return rows.map((row) => {
    const item: CategoryProviderSaveItem = {
      housekeeperId: row.housekeeperId,
      sortOrder: row.sortOrder,
    }
    const partnerStaffId = presentId(row.partnerStaffId)
    if (partnerStaffId)
      item.partnerStaffId = partnerStaffId
    else if (row.providerType !== HOUSEKEEPER_PROVIDER_THIRD_PARTY && row.staffId)
      item.staffId = row.staffId
    return item
  })
}
