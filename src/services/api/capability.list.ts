import type { ICapability, ICapabilityListQuery } from './capability.api'

/** 雪花/数字 ID 都收成 string,数组字段给默认值 */
export function normalizeCapability(raw: ICapability): ICapability {
  return {
    ...raw,
    capabilityId: String(raw.capabilityId),
    accessType: Number(raw.accessType) as ICapability['accessType'],
    tags: raw.tags ?? [],
    samplePrompts: raw.samplePrompts ?? [],
  }
}

export function normalizeCapabilityList(list?: ICapability[] | null): ICapability[] {
  return (list ?? []).map(normalizeCapability)
}

/** 对齐文档 §9:accessType / category 精确筛选,再按 sortOrder、capabilityId 升序 */
export function filterCapabilityList(items: ICapability[], query: ICapabilityListQuery = {}): ICapability[] {
  return items
    .filter((item) => {
      if (query.accessType != null && item.accessType !== query.accessType)
        return false
      if (query.category && item.category !== query.category)
        return false
      return true
    })
    .slice()
    .sort((a, b) => {
      const sort = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      if (sort !== 0)
        return sort
      return String(a.capabilityId).localeCompare(String(b.capabilityId), undefined, { numeric: true })
    })
}
