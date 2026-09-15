import type { IPageResult } from '../types/response.type'
import type { IHousekeeperOrder } from './housekeeper-order.api'

/** 后端 PageResult 里 pageNum/total 等可能是字符串,列表先收口成 number */
export type LooseHousekeeperOrderPage = Partial<Omit<IPageResult<IHousekeeperOrder>, 'pageNum' | 'pageSize' | 'total' | 'pages' | 'list'>> & {
  pageNum?: number | string
  pageSize?: number | string
  total?: number | string
  pages?: number | string
  list?: IHousekeeperOrder[] | null
}

export function normalizeHousekeeperOrderPage(raw?: LooseHousekeeperOrderPage | null): IPageResult<IHousekeeperOrder> {
  const list = raw?.list ?? []
  const pageNum = Number(raw?.pageNum) || 1
  const pageSize = Number(raw?.pageSize) || 10
  const total = Number(raw?.total) || 0
  const pages = Number(raw?.pages) || (pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize) || 1) : 1)

  return {
    pageNum,
    pageSize,
    total,
    pages,
    list,
    emptyFlag: raw?.emptyFlag ?? list.length === 0,
  }
}
