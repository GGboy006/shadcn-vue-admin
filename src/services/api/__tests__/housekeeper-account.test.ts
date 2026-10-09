import { describe, expect, it } from 'vitest'

import {
  buildHousekeeperSelfProfilePayload,
  buildStationHousekeeperSavePayload,
  canStationManageStaff,
  housekeeperAccountLabel,
  isHousekeeperAccountOpened,
  stationHousekeeperAccountIssues,
} from '@/services/api/housekeeper-account'

describe('housekeeper account', () => {
  it('userId 为空或 0 视为未开户', () => {
    expect(isHousekeeperAccountOpened({})).toBe(false)
    expect(isHousekeeperAccountOpened({ userId: '' })).toBe(false)
    expect(isHousekeeperAccountOpened({ userId: '0' })).toBe(false)
    expect(isHousekeeperAccountOpened({ userId: '100' })).toBe(true)
  })

  it('已开户的本地馆站长仍可改人员，第三方网点不行', () => {
    expect(canStationManageStaff({ providerType: 1 })).toBe(true)
    expect(canStationManageStaff({ providerType: 1, userId: '100' })).toBe(true)
    expect(canStationManageStaff({ providerType: 2 })).toBe(false)
    expect(housekeeperAccountLabel({ providerType: 2 })).toBe('第三方网点')
    expect(housekeeperAccountLabel({ userId: '100' })).toBe('已开户')
    expect(housekeeperAccountLabel({})).toBe('未开户')
  })

  it('新建本地馆必须同时有登录号和密码', () => {
    const issues = stationHousekeeperAccountIssues({ providerType: 1 })
    expect(issues.map(item => item.path)).toEqual(['loginPhone', 'password'])
  })

  it('未开户馆补开账号必须两项一起填', () => {
    const issues = stationHousekeeperAccountIssues({
      housekeeperId: '1',
      providerType: 1,
      loginPhone: '13800138000',
    })
    expect(issues).toEqual([{ path: 'password', message: '补开账号需同时填写登录密码' }])
  })

  it('已开户馆不能改成第三方网点', () => {
    const issues = stationHousekeeperAccountIssues({
      housekeeperId: '1',
      accountOpened: true,
      providerType: 2,
    })
    expect(issues.some(item => item.path === 'providerType')).toBe(true)
  })

  it('第三方保存不带登录字段', () => {
    const payload = buildStationHousekeeperSavePayload({
      name: '网点',
      providerType: 2,
      providerCode: 'ZMN',
      loginPhone: '13800138000',
      password: 'abc12345',
    })
    expect(payload.providerCode).toBe('ZMN')
    expect(payload.loginPhone).toBeUndefined()
    expect(payload.password).toBeUndefined()
  })

  it('管家资料只保留本馆展示字段', () => {
    const payload = buildHousekeeperSelfProfilePayload({
      housekeeperId: '100',
      name: '西小营家政',
      description: '',
      contactPhone: '13800138001',
    })
    expect(payload).toEqual({
      housekeeperId: '100',
      name: '西小营家政',
      description: undefined,
      icon: undefined,
      coverImage: undefined,
      contactName: undefined,
      contactPhone: '13800138001',
    })
    expect(payload).not.toHaveProperty('loginPhone')
    expect(payload).not.toHaveProperty('password')
    expect(payload).not.toHaveProperty('status')
  })
})
