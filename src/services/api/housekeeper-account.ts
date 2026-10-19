import { PHONE_REGEX } from '@/validators/common'

import type { HousekeeperProviderType, IHousekeeperService, IHousekeeperServiceSaveDTO } from './housekeeper.api'

import { localBusinessHourIssues } from './housekeeper-hours'

export const HOUSEKEEPER_PROVIDER_LOCAL = 1 as const
export const HOUSEKEEPER_PROVIDER_THIRD_PARTY = 2 as const

type AccountFields = Pick<IHousekeeperService, 'userId' | 'providerType'>

/** 已开通 userType=9 登录账号 */
export function isHousekeeperAccountOpened(service?: AccountFields | null): boolean {
  if (service?.userId == null)
    return false
  const userId = String(service.userId).trim()
  return userId !== '' && userId !== '0'
}

/** 第三方网点不开账号、不加师傅 */
export function isThirdPartyHousekeeper(service?: Pick<IHousekeeperService, 'providerType'> | null): boolean {
  return service?.providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY
}

export type HousekeeperOrgKind = 'local' | 'partner' | 'third-party'

/** 合作方也是外部网点，但有自己的人员；接口、小程序、H5 按整馆，没有人员列表 */
export function housekeeperOrgKind(
  service?: Pick<IHousekeeperService, 'providerType' | 'integrationMode'> | null,
): HousekeeperOrgKind {
  const mode = service?.integrationMode?.trim()
  if (mode === 'PARTNER')
    return 'partner'
  if (mode === 'API' || mode === 'MINI_JUMP' || mode === 'H5_JUMP')
    return 'third-party'
  if (isThirdPartyHousekeeper(service))
    return 'third-party'
  return 'local'
}

export function housekeeperIntegrationLabel(mode?: string | null) {
  if (mode === 'PARTNER')
    return '合作方'
  if (mode === 'API')
    return '接口'
  if (mode === 'MINI_JUMP')
    return '小程序'
  if (mode === 'H5_JUMP')
    return 'H5'
  return undefined
}

/** 站长可维护本地馆人员，含已开户的馆。第三方网点不能加师傅 */
export function canStationManageStaff(service?: AccountFields | null): boolean {
  if (!service || isThirdPartyHousekeeper(service))
    return false
  return true
}

export function housekeeperPayModeLabel(payMode?: number | null) {
  if (payMode === 1)
    return '线上'
  if (payMode === 2)
    return '线下'
  return undefined
}

export function housekeeperAccountLabel(service?: AccountFields | null): string {
  if (isThirdPartyHousekeeper(service))
    return '第三方网点'
  if (isHousekeeperAccountOpened(service))
    return '已开户'
  return '未开户'
}

export interface StationHousekeeperAccountInput {
  housekeeperId?: string
  providerType?: HousekeeperProviderType
  providerCode?: string
  loginPhone?: string
  password?: string
  accountOpened?: boolean
  openTime?: string
  closeTime?: string
  openDays?: string
}

export interface HousekeeperFieldIssue {
  path: 'providerType' | 'providerCode' | 'loginPhone' | 'password' | 'openTime' | 'closeTime' | 'openDays'
  message: string
}

/** 站长开户/改网点的前端校验。接口仍会拒绝越权 */
export function stationHousekeeperAccountIssues(values: StationHousekeeperAccountInput): HousekeeperFieldIssue[] {
  const providerType = values.providerType ?? HOUSEKEEPER_PROVIDER_LOCAL
  const loginPhone = values.loginPhone?.trim() ?? ''
  const password = values.password ?? ''
  const issues: HousekeeperFieldIssue[] = []

  if (providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY) {
    if (values.accountOpened)
      issues.push({ path: 'providerType', message: '已开通登录账号的馆不能改为第三方网点' })
    if (!values.providerCode?.trim())
      issues.push({ path: 'providerCode', message: '请选择第三方渠道' })
    return issues
  }

  if (!values.housekeeperId) {
    if (!loginPhone)
      issues.push({ path: 'loginPhone', message: '请输入登录手机号' })
    else if (!PHONE_REGEX.test(loginPhone))
      issues.push({ path: 'loginPhone', message: '请输入正确的 11 位手机号' })
    if (!password)
      issues.push({ path: 'password', message: '请输入登录密码' })
    else if (password.length < 6)
      issues.push({ path: 'password', message: '登录密码至少 6 位' })
  }
  else {
    if (loginPhone && !PHONE_REGEX.test(loginPhone))
      issues.push({ path: 'loginPhone', message: '请输入正确的 11 位手机号' })
    if (password && password.length < 6)
      issues.push({ path: 'password', message: '登录密码至少 6 位' })

    if (!values.accountOpened && (loginPhone || password) && (!loginPhone || !password)) {
      if (!loginPhone)
        issues.push({ path: 'loginPhone', message: '补开账号需同时填写登录手机号' })
      if (!password)
        issues.push({ path: 'password', message: '补开账号需同时填写登录密码' })
    }
  }

  issues.push(...localBusinessHourIssues(values))
  return issues
}

/** 下拉里去掉本站已经建过的渠道。编辑时保留当前这条。 */
export function availableFulfillChannels<T extends { providerCode: string }>(
  channels: T[],
  existing: { housekeeperId?: string, providerCode?: string | null }[],
  currentHousekeeperId?: string,
) {
  const taken = new Set(
    existing
      .filter(item => item.housekeeperId !== currentHousekeeperId && item.providerCode)
      .map(item => item.providerCode as string),
  )
  return channels.filter(item => !taken.has(item.providerCode))
}

export function buildStationHousekeeperSavePayload(values: IHousekeeperServiceSaveDTO & { accountOpened?: boolean }): IHousekeeperServiceSaveDTO {
  const providerType = values.providerType ?? HOUSEKEEPER_PROVIDER_LOCAL
  const payload: IHousekeeperServiceSaveDTO = {
    housekeeperId: values.housekeeperId,
    name: values.name,
    description: values.description || undefined,
    icon: values.icon || undefined,
    coverImage: values.coverImage || undefined,
    contactName: values.contactName || undefined,
    contactPhone: values.contactPhone || undefined,
    merchantId: values.merchantId || undefined,
    sortOrder: values.sortOrder,
    status: values.status,
    providerType,
  }

  if (providerType === HOUSEKEEPER_PROVIDER_THIRD_PARTY) {
    payload.providerCode = values.providerCode?.trim() || undefined
    return payload
  }

  if (values.payMode === 1 || values.payMode === 2)
    payload.payMode = values.payMode
  if (values.openTime && values.closeTime && values.openDays) {
    payload.openTime = values.openTime
    payload.closeTime = values.closeTime
    payload.openDays = values.openDays
  }

  const loginPhone = values.loginPhone?.trim()
  if (loginPhone)
    payload.loginPhone = loginPhone
  if (values.password)
    payload.password = values.password
  return payload
}

/** 管家只能改本馆展示资料，不能改登录号、密码、启停和网点 */
export function buildHousekeeperSelfProfilePayload(values: Pick<IHousekeeperServiceSaveDTO, 'housekeeperId' | 'name' | 'description' | 'icon' | 'coverImage' | 'contactName' | 'contactPhone' | 'openTime' | 'closeTime' | 'openDays'>): IHousekeeperServiceSaveDTO {
  const payload: IHousekeeperServiceSaveDTO = {
    housekeeperId: values.housekeeperId,
    name: values.name,
    description: values.description || undefined,
    icon: values.icon || undefined,
    coverImage: values.coverImage || undefined,
    contactName: values.contactName || undefined,
    contactPhone: values.contactPhone || undefined,
  }
  if (values.openTime && values.closeTime && values.openDays) {
    payload.openTime = values.openTime
    payload.closeTime = values.closeTime
    payload.openDays = values.openDays
  }
  return payload
}
