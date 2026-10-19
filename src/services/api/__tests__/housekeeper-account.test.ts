import { describe, expect, it } from 'vitest'

import {
  availableFulfillChannels,
  buildHousekeeperSelfProfilePayload,
  buildStationHousekeeperSavePayload,
  canStationManageStaff,
  housekeeperAccountLabel,
  housekeeperOrgKind,
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

  it('机构上的 integrationMode 区分本地馆、渠道和合作方', () => {
    expect(housekeeperOrgKind({})).toBe('local')
    expect(housekeeperOrgKind({ integrationMode: '' })).toBe('local')
    expect(housekeeperOrgKind({ integrationMode: 'PARTNER' })).toBe('partner')
    expect(housekeeperOrgKind({ integrationMode: 'API' })).toBe('third-party')
    expect(housekeeperOrgKind({ integrationMode: 'MINI_JUMP' })).toBe('third-party')
    expect(housekeeperOrgKind({ integrationMode: 'H5_JUMP' })).toBe('third-party')
    expect(housekeeperOrgKind({ providerType: 2 })).toBe('third-party')
  })

  it('新建本地馆必须同时有登录号、密码和营业时间', () => {
    const issues = stationHousekeeperAccountIssues({ providerType: 1 })
    expect(issues.map(item => item.path)).toEqual(['loginPhone', 'password', 'openTime', 'closeTime', 'openDays'])
  })

  it('未开户馆补开账号必须两项一起填', () => {
    const issues = stationHousekeeperAccountIssues({
      housekeeperId: '1',
      providerType: 1,
      loginPhone: '13800138000',
      openTime: '09:00:00',
      closeTime: '18:00:00',
      openDays: '1,2,3,4,5',
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

  it('第三方保存不带登录字段和营业时间', () => {
    const payload = buildStationHousekeeperSavePayload({
      name: '网点',
      providerType: 2,
      providerCode: 'ZMN',
      loginPhone: '13800138000',
      password: 'abc12345',
      payMode: 2,
      openTime: '09:00:00',
      closeTime: '18:00:00',
      openDays: '1,2,3,4,5',
    })
    expect(payload.providerCode).toBe('ZMN')
    expect(payload.loginPhone).toBeUndefined()
    expect(payload.password).toBeUndefined()
    expect(payload.payMode).toBeUndefined()
    expect(payload.openTime).toBeUndefined()
    expect(payload.openDays).toBeUndefined()
  })

  it('本地馆保存带上支付方式和营业时间', () => {
    const payload = buildStationHousekeeperSavePayload({
      name: '西小营家政',
      providerType: 1,
      payMode: 2,
      loginPhone: '13800138000',
      password: 'abc12345',
      openTime: '09:00:00',
      closeTime: '18:00:00',
      openDays: '1,2,3,4,5',
    })
    expect(payload.payMode).toBe(2)
    expect(payload.openTime).toBe('09:00:00')
    expect(payload.closeTime).toBe('18:00:00')
    expect(payload.openDays).toBe('1,2,3,4,5')
  })

  it('下拉去掉已建渠道，编辑时保留自己的编码', () => {
    const channels = [
      { providerCode: 'WSF', providerName: '万师傅' },
      { providerCode: 'ZMN', providerName: '啄木鸟' },
    ]
    const existing = [
      { housekeeperId: '1', providerCode: 'WSF' },
      { housekeeperId: '2', providerCode: 'ZMN' },
    ]
    expect(availableFulfillChannels(channels, existing).map(item => item.providerCode)).toEqual([])
    expect(availableFulfillChannels(channels, existing, '1').map(item => item.providerCode)).toEqual(['WSF'])
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

  it('管家改营业时间时三项一起提交', () => {
    const payload = buildHousekeeperSelfProfilePayload({
      housekeeperId: '100',
      name: '西小营家政',
      openTime: '09:00:00',
      closeTime: '18:00:00',
      openDays: '1,2,3,4,5',
    })
    expect(payload.openTime).toBe('09:00:00')
    expect(payload.closeTime).toBe('18:00:00')
    expect(payload.openDays).toBe('1,2,3,4,5')
    expect(payload).not.toHaveProperty('loginPhone')
  })
})
