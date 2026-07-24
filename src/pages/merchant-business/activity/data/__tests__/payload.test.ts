import { describe, expect, it } from 'vitest'

import type { ActivityFormValues } from '@/pages/merchant-business/activity/data/schema'
import type { IActivityAddReq, IActivityUpdateReq } from '@/services/api/merchant-business.api'

import { buildActivityPayload, formatActivityDateTime, toDateTimeLocalInput } from '@/pages/merchant-business/activity/data/payload'

describe('buildActivityPayload', () => {
  const validValues: ActivityFormValues = {
    name: '周末满减',
    startTime: '2026-07-25T00:00',
    endTime: '2026-07-27T23:59',
    isCharge: 1,
    salePrice: 99,
    isRecommend: 1,
    isEnable: 1,
  }

  describe('create', () => {
    it('should build add req with required fields and format datetimes as yyyy-MM-dd HH:mm:ss', () => {
      const result = buildActivityPayload(validValues, undefined)

      expect(result).toEqual<IActivityAddReq>({
        name: '周末满减',
        startTime: '2026-07-25 00:00:00',
        endTime: '2026-07-27 23:59:00',
        isCharge: 1,
        salePrice: 99,
        isRecommend: 1,
        isEnable: 1,
      })
      expect(result).not.toHaveProperty('uniqueCode')
    })

    it('should throw when name empty', () => {
      expect(() => buildActivityPayload({ ...validValues, name: '' }, undefined)).toThrow()
    })

    it('should throw when startTime missing', () => {
      expect(() => buildActivityPayload({ ...validValues, startTime: '' }, undefined)).toThrow()
    })

    it('should throw when endTime missing', () => {
      expect(() => buildActivityPayload({ ...validValues, endTime: '' }, undefined)).toThrow()
    })

    it('should throw when endTime earlier than startTime', () => {
      expect(() => buildActivityPayload({
        ...validValues,
        startTime: '2026-07-27T23:59',
        endTime: '2026-07-25T00:00',
      }, undefined)).toThrow()
    })

    it('should omit optional fields when undefined', () => {
      const result = buildActivityPayload({ name: '活动', startTime: '2026-07-25T00:00', endTime: '2026-07-27T00:00' }, undefined)

      expect(result).toEqual<IActivityAddReq>({
        name: '活动',
        startTime: '2026-07-25 00:00:00',
        endTime: '2026-07-27 00:00:00',
      })
    })

    it('should omit optional fields when null (edit echo may return null)', () => {
      const result = buildActivityPayload({
        name: '活动',
        startTime: '2026-07-25T00:00',
        endTime: '2026-07-27T00:00',
        salePrice: null as unknown as number,
        torder: null as unknown as number,
        poster: null as unknown as string,
        describes: null as unknown as string,
      }, undefined)

      expect(result).toEqual<IActivityAddReq>({
        name: '活动',
        startTime: '2026-07-25 00:00:00',
        endTime: '2026-07-27 00:00:00',
      })
      expect(result).not.toHaveProperty('salePrice')
      expect(result).not.toHaveProperty('torder')
      expect(result).not.toHaveProperty('poster')
      expect(result).not.toHaveProperty('describes')
    })

    it('should accept already-formatted datetime strings', () => {
      const result = buildActivityPayload({
        ...validValues,
        startTime: '2026-07-25 00:00:00',
        endTime: '2026-07-27 23:59:00',
      }, undefined)

      expect(result.startTime).toBe('2026-07-25 00:00:00')
      expect(result.endTime).toBe('2026-07-27 23:59:00')
    })
  })

  describe('update', () => {
    it('should build update req with uniqueCode', () => {
      const result = buildActivityPayload(validValues, 'ACT_001')

      expect(result).toEqual<IActivityUpdateReq>({
        uniqueCode: 'ACT_001',
        name: '周末满减',
        startTime: '2026-07-25 00:00:00',
        endTime: '2026-07-27 23:59:00',
        isCharge: 1,
        salePrice: 99,
        isRecommend: 1,
        isEnable: 1,
      })
    })
  })
})

describe('formatActivityDateTime', () => {
  it('should format datetime-local value (no seconds, with T) to backend format', () => {
    expect(formatActivityDateTime('2026-07-24T16:43')).toBe('2026-07-24 16:43:00')
  })

  it('should format ISO string with seconds to backend format', () => {
    expect(formatActivityDateTime('2026-07-24T16:43:00')).toBe('2026-07-24 16:43:00')
  })

  it('should normalize already-formatted backend string', () => {
    expect(formatActivityDateTime('2026-07-24 16:43:00')).toBe('2026-07-24 16:43:00')
  })
})

describe('toDateTimeLocalInput', () => {
  it('should convert backend format (with space) to datetime-local format', () => {
    expect(toDateTimeLocalInput('2026-07-24 16:43:00')).toBe('2026-07-24T16:43')
  })

  it('should convert ISO format to datetime-local format', () => {
    expect(toDateTimeLocalInput('2026-07-24T16:43:00')).toBe('2026-07-24T16:43')
  })

  it('should return empty string for falsy input', () => {
    expect(toDateTimeLocalInput('')).toBe('')
    expect(toDateTimeLocalInput(undefined as unknown as string)).toBe('')
  })
})
