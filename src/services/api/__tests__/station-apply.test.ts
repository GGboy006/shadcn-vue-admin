import { describe, expect, it } from 'vitest'

import { buildStationApplyAddDTO } from '@/services/api/station-apply.payload'

describe('buildStationApplyAddDTO', () => {
  it('完整字段原样带上 remark', () => {
    expect(buildStationApplyAddDTO({
      communityName: '桂园小区',
      contactName: '张三',
      phone: '13800138000',
      identity: 'property',
      remark: '预计 20 家商户',
    })).toEqual({
      communityName: '桂园小区',
      contactName: '张三',
      phone: '13800138000',
      identity: 'property',
      remark: '预计 20 家商户',
    })
  })

  it('空备注不传 remark', () => {
    expect(buildStationApplyAddDTO({
      communityName: '桂园小区',
      contactName: '张三',
      phone: '13800138000',
      identity: 'committee',
      remark: '   ',
    })).toEqual({
      communityName: '桂园小区',
      contactName: '张三',
      phone: '13800138000',
      identity: 'committee',
    })
  })
})
