import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

import { stringifyMemberId } from './community-member.page'

/** 身份类型:1=业主,2=租户,3=家属 */
export type ResidentIdentityType = 1 | 2 | 3
/** 认证状态:0=未认证,1=认证中,2=已认证,3=失败 */
export type ResidentVerifyStatus = 0 | 1 | 2 | 3
/** 性别:0=未知,1=男,2=女 */
export type ResidentGender = 0 | 1 | 2
/** 启用状态:1=启用,2=禁用 */
export type ResidentEnableStatus = 1 | 2
/** 会员状态:0非会员 / 1有效 / 2已过期 / 3已取消 */
export type ResidentMemberStatus = 0 | 1 | 2 | 3

export const residentIdentityTypeConfig: Record<ResidentIdentityType, { label: string, variant: 'default' | 'info' | 'secondary' }> = {
  1: { label: '业主', variant: 'default' },
  2: { label: '租户', variant: 'info' },
  3: { label: '家属', variant: 'secondary' },
}

export const residentVerifyStatusConfig: Record<ResidentVerifyStatus, { label: string, variant: 'secondary' | 'warning' | 'success' | 'destructive' }> = {
  0: { label: '未认证', variant: 'secondary' },
  1: { label: '认证中', variant: 'warning' },
  2: { label: '已认证', variant: 'success' },
  3: { label: '认证失败', variant: 'destructive' },
}

export const residentGenderConfig: Record<ResidentGender, { label: string }> = {
  0: { label: '未知' },
  1: { label: '男' },
  2: { label: '女' },
}

export const residentEnableStatusConfig: Record<ResidentEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

export const residentMemberStatusConfig: Record<ResidentMemberStatus, { label: string, variant: 'secondary' | 'success' | 'warning' }> = {
  0: { label: '非会员', variant: 'secondary' },
  1: { label: '有效', variant: 'success' },
  2: { label: '已过期', variant: 'warning' },
  3: { label: '已取消', variant: 'secondary' },
}

export interface IResidentListQuery extends IPageParam {
  /** 昵称/手机/门牌/楼栋 */
  keyword?: string
  identityType?: ResidentIdentityType
  verifyStatus?: ResidentVerifyStatus
  status?: ResidentEnableStatus
  buildingNo?: string
}

export interface IResident {
  residentId: string
  userId?: string
  stationId?: string
  nickname?: string
  avatar?: string
  phone?: string
  gender?: ResidentGender
  buildingNo?: string
  unitNo?: string
  roomNo?: string
  doorplate?: string
  houseArea?: number
  houseType?: string
  identityType?: ResidentIdentityType
  identityTypeLabel?: string
  isMember?: 0 | 1
  isMemberLabel?: string
  memberStatus?: ResidentMemberStatus
  memberStatusLabel?: string
  memberExpireTime?: string
  verifyStatus?: ResidentVerifyStatus
  verifyStatusLabel?: string
  verifyTime?: string
  aiToolCount?: number
  lastActiveTime?: string
  remark?: string
  status?: ResidentEnableStatus
  createTime?: string
  updateTime?: string
}

export interface IResidentVerifyAuditDTO {
  passed: boolean
  remark?: string
}

export type IResidentListResponse = IResponse<IPageResult<IResident>>
export type IResidentDetailResponse = IResponse<IResident>

export function normalizeResident(raw: IResident): IResident {
  return {
    ...raw,
    residentId: stringifyMemberId(raw.residentId) ?? '',
    userId: stringifyMemberId(raw.userId),
    stationId: stringifyMemberId(raw.stationId),
  }
}

export function canAuditResidentVerify(resident: Pick<IResident, 'verifyStatus'>): boolean {
  return resident.verifyStatus === 1
}

export function residentMemberStatusText(status?: ResidentMemberStatus) {
  if (status == null)
    return '-'
  return residentMemberStatusConfig[status]?.label ?? String(status)
}
