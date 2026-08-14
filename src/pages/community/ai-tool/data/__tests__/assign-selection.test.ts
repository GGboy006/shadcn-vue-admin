import { describe, expect, it } from 'vitest'

import type { IResidentAiToolAssignSkill } from '@/services/api/resident-ai-tool.api'

import {
  clearAllVisible,
  diffSelection,
  filterByName,
  selectAllVisible,
  toCheckedIds,
  toggleId,
} from '../assign-selection'

/** 构造候选工具,skillId 用真实雪花量级的字符串,防止有人改成 number */
function skill(
  skillId: string,
  overrides: Partial<IResidentAiToolAssignSkill> = {},
): IResidentAiToolAssignSkill {
  return {
    skillId,
    name: `工具${skillId}`,
    checked: false,
    ...overrides,
  }
}

const LIST: IResidentAiToolAssignSkill[] = [
  skill('1888888888888888881', { name: '智能问答', checked: true }),
  skill('1888888888888888882', { name: '图片识别' }),
  skill('1888888888888888883', { name: '语音转写', checked: true }),
  skill('1888888888888888884', { name: '报修向导' }),
]

describe('toCheckedIds', () => {
  it('只取后端 checked 为 true 的项', () => {
    expect([...toCheckedIds(LIST)]).toEqual([
      '1888888888888888881',
      '1888888888888888883',
    ])
  })

  it('空列表得到空集合', () => {
    expect(toCheckedIds([]).size).toBe(0)
  })

  it('全未配置时得到空集合', () => {
    expect(toCheckedIds([skill('1'), skill('2')]).size).toBe(0)
  })
})

describe('toggleId', () => {
  it('未选中则加入', () => {
    const next = toggleId(new Set(['a']), 'b')
    expect([...next]).toEqual(['a', 'b'])
  })

  it('已选中则移除', () => {
    const next = toggleId(new Set(['a', 'b']), 'b')
    expect([...next]).toEqual(['a'])
  })

  it('不修改入参', () => {
    const original = new Set(['a'])
    toggleId(original, 'b')
    expect([...original]).toEqual(['a'])
  })
})

describe('selectAllVisible', () => {
  it('并入可见项', () => {
    const next = selectAllVisible(new Set(), LIST)
    expect(next.size).toBe(4)
  })

  it('保留被过滤掉的已选项(不做覆盖)', () => {
    // 搜索「图片」后可见项只有一条,已选的 ...881 被过滤掉了
    const visible = filterByName(LIST, '图片')
    const next = selectAllVisible(new Set(['1888888888888888881']), visible)

    expect(next.has('1888888888888888881')).toBe(true)
    expect(next.has('1888888888888888882')).toBe(true)
    expect(next.size).toBe(2)
  })

  it('不修改入参', () => {
    const original = new Set<string>()
    selectAllVisible(original, LIST)
    expect(original.size).toBe(0)
  })
})

describe('clearAllVisible', () => {
  it('移除全部可见项', () => {
    const next = clearAllVisible(toCheckedIds(LIST), LIST)
    expect(next.size).toBe(0)
  })

  it('保留被过滤掉的已选项(不做整体清空)', () => {
    // 搜索「语音」后只应清掉 ...883,已选的 ...881 必须留下
    const visible = filterByName(LIST, '语音')
    const next = clearAllVisible(toCheckedIds(LIST), visible)

    expect([...next]).toEqual(['1888888888888888881'])
  })

  it('不修改入参', () => {
    const original = new Set(['1888888888888888881'])
    clearAllVisible(original, LIST)
    expect(original.size).toBe(1)
  })
})

describe('diffSelection', () => {
  it('无改动时 isDirty 为 false', () => {
    const checked = toCheckedIds(LIST)
    const result = diffSelection(checked, new Set(checked))

    expect(result).toEqual({
      added: [],
      removed: [],
      isDirty: false,
      isClearing: false,
    })
  })

  it('识别新增项', () => {
    const original = toCheckedIds(LIST)
    const current = toggleId(original, '1888888888888888882')
    const result = diffSelection(original, current)

    expect(result.added).toEqual(['1888888888888888882'])
    expect(result.removed).toEqual([])
    expect(result.isDirty).toBe(true)
    expect(result.isClearing).toBe(false)
  })

  it('识别移除项', () => {
    const original = toCheckedIds(LIST)
    const current = toggleId(original, '1888888888888888881')
    const result = diffSelection(original, current)

    expect(result.added).toEqual([])
    expect(result.removed).toEqual(['1888888888888888881'])
    expect(result.isDirty).toBe(true)
  })

  it('同时新增与移除', () => {
    const original = toCheckedIds(LIST)
    const current = toggleId(
      toggleId(original, '1888888888888888881'),
      '1888888888888888884',
    )
    const result = diffSelection(original, current)

    expect(result.added).toEqual(['1888888888888888884'])
    expect(result.removed).toEqual(['1888888888888888881'])
  })

  it('全部移除时 isClearing 为 true(触发破坏性确认文案)', () => {
    const original = toCheckedIds(LIST)
    const result = diffSelection(original, clearAllVisible(original, LIST))

    expect(result.isClearing).toBe(true)
    expect(result.removed).toHaveLength(2)
  })

  it('原本就没有配置时不算清空', () => {
    const result = diffSelection(new Set(), new Set())

    expect(result.isClearing).toBe(false)
    expect(result.isDirty).toBe(false)
  })

  it('从空配置新增后再撤回不算清空', () => {
    const result = diffSelection(new Set(), new Set(['a']))
    expect(result.isClearing).toBe(false)
    expect(result.added).toEqual(['a'])
  })
})

describe('filterByName', () => {
  it('空关键词返回全部', () => {
    expect(filterByName(LIST, '')).toHaveLength(4)
  })

  it('纯空格视为空关键词', () => {
    expect(filterByName(LIST, '   ')).toHaveLength(4)
  })

  it('按名称子串匹配', () => {
    expect(filterByName(LIST, '语音').map(s => s.skillId)).toEqual([
      '1888888888888888883',
    ])
  })

  it('忽略大小写', () => {
    const list = [skill('1', { name: 'OCR识别' })]
    expect(filterByName(list, 'ocr')).toHaveLength(1)
  })

  it('无匹配返回空数组', () => {
    expect(filterByName(LIST, '不存在的工具')).toEqual([])
  })

  it('返回新数组,不修改入参', () => {
    const result = filterByName(LIST, '')
    expect(result).not.toBe(LIST)
    expect(LIST).toHaveLength(4)
  })
})
