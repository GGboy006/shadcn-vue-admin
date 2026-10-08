import { describe, expect, it } from 'vitest'

import {
  accessTypeBadgeVariant,
  capabilityAccessTypeLabel,
  capabilityCategoryFilterOptions,
  categoryText,
} from '../status'

describe('capability status labels', () => {
  it('labels MCP / Skill / 智能体', () => {
    expect(capabilityAccessTypeLabel).toEqual({
      1: 'MCP',
      2: 'Skill',
      3: '智能体',
    })
  })

  it('gives 智能体 a badge variant distinct from MCP and Skill', () => {
    expect(accessTypeBadgeVariant(1)).toBe('info')
    expect(accessTypeBadgeVariant(2)).toBe('secondary')
    expect(accessTypeBadgeVariant(3)).toBe('success')
  })

  it('uses Chinese category values as both filter value and label', () => {
    expect(capabilityCategoryFilterOptions).toContainEqual({ value: '酒旅', label: '酒旅' })
    expect(capabilityCategoryFilterOptions).toContainEqual({ value: '政务政策知识', label: '政务政策知识' })
    expect(capabilityCategoryFilterOptions.some(item => item.value === 'travel')).toBe(false)
  })

  it('renders category text without English code mapping', () => {
    expect(categoryText('酒旅')).toBe('酒旅')
    expect(categoryText('travel')).toBe('travel')
    expect(categoryText()).toBe('-')
    expect(categoryText('')).toBe('-')
  })
})
