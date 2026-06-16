import { describe, expect, it } from 'vitest'

import { formatDateTime } from '../date'

describe('formatDateTime', () => {
  it('returns a Chinese locale string for a valid ISO date', () => {
    const result = formatDateTime('2024-05-20T10:30:00')
    expect(result).toContain('2024')
    expect(result).toContain('10:30')
  })

  it('returns "-" when input is undefined', () => {
    expect(formatDateTime(undefined)).toBe('-')
  })

  it('returns "-" when input is an empty string', () => {
    expect(formatDateTime('')).toBe('-')
  })
})
