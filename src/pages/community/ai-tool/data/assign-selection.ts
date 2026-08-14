import type { IResidentAiToolAssignSkill } from '@/services/api/resident-ai-tool.api'

/**
 * 居民AI工具「分配勾选」纯逻辑。
 *
 * 从 `[cateCode].vue` 抽出,因为 `POST /assign` 是按分类全量覆盖
 * (对接文档 §4.3),勾选集合的每一次增删都直接决定提交内容,
 * 算错一处就会静默地把居民端的工具下线,故此处独立成模块并配单测。
 *
 * 约定:
 * - 所有函数返回**新** Set,不修改入参(不可变)
 * - `original` 是后端真相(来自 `assign-list` 的 `checked`),`current` 是本地编辑态
 */

/** 从候选列表中取出后端已配置的 skillId 集合 */
export function toCheckedIds(list: readonly IResidentAiToolAssignSkill[]): Set<string> {
  const checked = new Set<string>()
  for (const skill of list) {
    if (skill.checked)
      checked.add(skill.skillId)
  }
  return checked
}

/** 切换单个 skillId 的勾选态 */
export function toggleId(current: ReadonlySet<string>, skillId: string): Set<string> {
  const next = new Set(current)
  if (next.has(skillId))
    next.delete(skillId)
  else
    next.add(skillId)
  return next
}

/**
 * 并入可见列表(全选)。
 *
 * 只做并集,不做覆盖 —— 否则在搜索状态下会把被过滤掉的已选项误删。
 */
export function selectAllVisible(
  current: ReadonlySet<string>,
  visible: readonly IResidentAiToolAssignSkill[],
): Set<string> {
  const next = new Set(current)
  for (const skill of visible)
    next.add(skill.skillId)
  return next
}

/**
 * 移除可见列表(清空)。
 *
 * 只做差集,同理不影响被过滤掉的已选项。
 */
export function clearAllVisible(
  current: ReadonlySet<string>,
  visible: readonly IResidentAiToolAssignSkill[],
): Set<string> {
  const next = new Set(current)
  for (const skill of visible)
    next.delete(skill.skillId)
  return next
}

/** 本次编辑相对后端真相的差异 */
export interface AssignSelectionDiff {
  /** 将新增开放的 skillId */
  added: string[]
  /** 将取消开放的 skillId */
  removed: string[]
  /** 是否有未保存改动 */
  isDirty: boolean
  /** 是否为「清空该分类」(原有配置被全部移除) */
  isClearing: boolean
}

export function diffSelection(
  original: ReadonlySet<string>,
  current: ReadonlySet<string>,
): AssignSelectionDiff {
  const added = [...current].filter(id => !original.has(id))
  const removed = [...original].filter(id => !current.has(id))

  return {
    added,
    removed,
    isDirty: added.length > 0 || removed.length > 0,
    isClearing: current.size === 0 && original.size > 0,
  }
}

/** 按名称做前端过滤(列表不分页,故不走后端 name 参数,避免重置未保存的勾选) */
export function filterByName(
  list: readonly IResidentAiToolAssignSkill[],
  keyword: string,
): IResidentAiToolAssignSkill[] {
  const k = keyword.trim().toLowerCase()
  if (!k)
    return [...list]
  return list.filter(skill => skill.name?.toLowerCase().includes(k))
}
