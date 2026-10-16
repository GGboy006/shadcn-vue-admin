import { describe, expect, it } from 'vitest'

import { buildAppointmentSlots, buildReassignPayload, localBusinessHourIssues } from '@/services/api/housekeeper-hours'

describe('housekeeper business hours', () => {
  it('拒绝不足 1 小时或结束不晚于开始', () => {
    expect(localBusinessHourIssues({
      openTime: '09:00:00',
      closeTime: '09:30:00',
      openDays: '1',
    }).map(item => item.message)).toContain('营业窗口至少 1 小时')
    expect(localBusinessHourIssues({
      openTime: '18:00:00',
      closeTime: '09:00:00',
      openDays: '1,2,3,4,5',
    }).map(item => item.message)).toContain('结束须晚于开始')
  })

  it('按营业窗口切出整点 60 分钟档，并丢掉太近的档', () => {
    const slots = buildAppointmentSlots({
      date: '2026-10-21',
      openTime: '09:00:00',
      closeTime: '12:00:00',
      openDays: '1,2,3,4,5,6,7',
      now: new Date(2026, 9, 21, 8, 0, 0),
    })
    expect(slots.map(slot => slot.label)).toEqual(['09:00–10:00', '10:00–11:00', '11:00–12:00'])
    expect(slots[0]).toMatchObject({
      start: '2026-10-21 09:00:00',
      end: '2026-10-21 10:00:00',
    })

    const later = buildAppointmentSlots({
      date: '2026-10-21',
      openTime: '09:00:00',
      closeTime: '12:00:00',
      openDays: '1,2,3,4,5,6,7',
      now: new Date(2026, 9, 21, 8, 30, 0),
    })
    expect(later.map(slot => slot.label)).toEqual(['10:00–11:00', '11:00–12:00'])
  })

  it('闭馆日没有档', () => {
    expect(buildAppointmentSlots({
      date: '2026-10-25',
      openTime: '09:00:00',
      closeTime: '18:00:00',
      openDays: '1,2,3,4,5',
      now: new Date(2026, 9, 20, 8, 0, 0),
    })).toEqual([])
  })

  it('改派不改时间时不提交预约字段', () => {
    expect(buildReassignPayload({
      staffId: '10',
      remark: ' 原师傅请假 ',
    })).toEqual({
      staffId: '10',
      remark: '原师傅请假',
    })
  })

  it('改派改时间时开始和结束一起提交', () => {
    expect(buildReassignPayload({
      staffId: '10',
      appointmentTime: '2026-10-21 14:00:00',
      appointmentEndTime: '2026-10-21 15:00:00',
    })).toEqual({
      staffId: '10',
      appointmentTime: '2026-10-21 14:00:00',
      appointmentEndTime: '2026-10-21 15:00:00',
    })
  })
})
