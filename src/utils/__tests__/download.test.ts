import { describe, expect, it } from 'vitest'

import {
  buildDownloadUrl,
  buildExportFilename,
  formatExportTimestamp,
} from '@/utils/download'

describe('download utils', () => {
  describe('formatExportTimestamp', () => {
    it('should format date as yyyyMMddHHmm', () => {
      const date = new Date('2026-07-20T14:30:45')

      expect(formatExportTimestamp(date)).toBe('202607201430')
    })

    it('should pad single-digit month/day/hour/minute with leading zero', () => {
      const date = new Date('2026-01-05T09:08:00')

      expect(formatExportTimestamp(date)).toBe('202601050908')
    })

    it('should default to now when no date given', () => {
      const result = formatExportTimestamp()

      expect(result).toMatch(/^\d{12}$/)
    })
  })

  describe('buildExportFilename', () => {
    it('should compose filename with prefix, timestamp and extension', () => {
      const date = new Date('2026-07-20T14:30:00')

      expect(buildExportFilename('订单导出', 'xlsx', date)).toBe('订单导出_202607201430.xlsx')
    })

    it('should handle extension without leading dot', () => {
      const date = new Date('2026-01-01T00:00:00')

      expect(buildExportFilename('report', 'csv', date)).toBe('report_202601010000.csv')
    })
  })

  describe('buildDownloadUrl', () => {
    it('should concatenate base and path', () => {
      const url = buildDownloadUrl('http://api.example.com/api', '/merchant/order/M1/export')

      expect(url).toBe('http://api.example.com/api/merchant/order/M1/export')
    })

    it('should append query params as search string', () => {
      const url = buildDownloadUrl('http://api.example.com/api', '/merchant/order/M1/export', {
        statusType: 2,
        keyword: '咖啡',
      })

      expect(url).toContain('statusType=2')
      expect(url).toContain('keyword=')
    })

    it('should skip undefined/null/empty query values', () => {
      const url = buildDownloadUrl('http://api.example.com/api', '/merchant/order/M1/export', {
        statusType: undefined,
        keyword: null as unknown as string,
        empty: '',
        keep: '1',
      })

      expect(url).not.toContain('statusType')
      expect(url).not.toContain('keyword')
      expect(url).not.toContain('empty')
      expect(url).toContain('keep=1')
    })

    it('should return base+path unchanged when query omitted', () => {
      const url = buildDownloadUrl('http://api.example.com/api', '/merchant/order/M1/export')

      expect(url).toBe('http://api.example.com/api/merchant/order/M1/export')
    })
  })
})
