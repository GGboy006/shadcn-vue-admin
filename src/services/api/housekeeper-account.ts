import { PHONE_REGEX } from '@/validators/common'

import type { HousekeeperProviderType, IHousekeeperService, IHousekeeperServiceSaveDTO } from './housekeeper.api'

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

/** 站长可维护本地馆人员，含已开户的馆。第三方网点不能加师傅 */
export function canStationManageStaff(service?: AccountFields | null): boolean {
  if (!service || isThirdPartyHousekeeper(service))
    return false
  return true
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
}

export interface HousekeeperFieldIssue {
  path: 'providerType' | 'providerCode' | 'loginPhone' | 'password'
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
    return issues
  }

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

  return issues
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

  const loginPhone = values.loginPhone?.trim()
  if (loginPhone)
    payload.loginPhone = loginPhone
  if (values.password)
    payload.password = values.password
  return payload
}

/** 管家只能改本馆展示资料，不能改登录号、密码、启停和网点 */
export function buildHousekeeperSelfProfilePayload(values: Pick<IHousekeeperServiceSaveDTO, 'housekeeperId' | 'name' | 'description' | 'icon' | 'coverImage' | 'contactName' | 'contactPhone'>): IHousekeeperServiceSaveDTO {
  return {
    housekeeperId: values.housekeeperId,
    name: values.name,
    description: values.description || undefined,
    icon: values.icon || undefined,
    coverImage: values.coverImage || undefined,
    contactName: values.contactName || undefined,
    contactPhone: values.contactPhone || undefined,
  }
}
