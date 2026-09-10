import { describe, expect, it } from 'vitest'

import type { ICommunityCateTreeNode } from '@/services/api/community-cate.api'

import { findCatePath, formatCatePathLabel, isCateLeaf } from '../community-cate-tree'

const tree: ICommunityCateTreeNode[] = [
  {
    uniqueCode: 'p1',
    parentCode: '0',
    name: '办事指南',
    type: 2,
    children: [
      { uniqueCode: 'c1', parentCode: 'p1', name: '读书会&阅览室', type: 2, children: [] },
      { uniqueCode: 'c2', parentCode: 'p1', name: '常用服务', type: 2, children: [] },
    ],
  },
  {
    uniqueCode: 'p2',
    parentCode: '0',
    name: '服务',
    type: 5,
    children: [
      { uniqueCode: 'c3', parentCode: 'p2', name: '上门回收', type: 5, children: [] },
    ],
  },
]

describe('findCatePath', () => {
  it('returns empty when tree or code is missing', () => {
    expect(findCatePath(undefined, 'c1')).toEqual([])
    expect(findCatePath([], 'c1')).toEqual([])
    expect(findCatePath(tree, '')).toEqual([])
    expect(findCatePath(tree, undefined)).toEqual([])
  })

  it('finds a two-level leaf path', () => {
    expect(findCatePath(tree, 'c1')).toEqual([
      { uniqueCode: 'p1', name: '办事指南' },
      { uniqueCode: 'c1', name: '读书会&阅览室' },
    ])
  })

  it('finds a first-level node', () => {
    expect(findCatePath(tree, 'p2')).toEqual([
      { uniqueCode: 'p2', name: '服务' },
    ])
  })

  it('returns empty when code is not in the tree', () => {
    expect(findCatePath(tree, 'missing')).toEqual([])
  })
})

describe('formatCatePathLabel', () => {
  it('joins names with a slash', () => {
    expect(formatCatePathLabel(findCatePath(tree, 'c3'))).toBe('服务 / 上门回收')
  })

  it('returns empty for an empty path', () => {
    expect(formatCatePathLabel([])).toBe('')
  })
})

describe('isCateLeaf', () => {
  it('treats empty children as a leaf', () => {
    expect(isCateLeaf(tree[0]!.children![0])).toBe(true)
    expect(isCateLeaf(tree[0])).toBe(false)
    expect(isCateLeaf(null)).toBe(false)
  })
})
