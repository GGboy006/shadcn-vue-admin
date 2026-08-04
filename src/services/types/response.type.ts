/**
 * 统一响应包装,对齐后端 `BaseResponse<T>`
 *
 * - `code`: 0=成功,其他为错误码
 * - `msg`: 提示信息
 * - `level`: 错误级别(可空)
 * - `data`: 业务数据
 *
 * 注意:运行时 use-fetch 也是读 `code` / `msg` 判错,与此类型一致。
 */
export interface IResponse<T> {
  /** 0=成功,其他为错误码 */
  code: number
  /** 提示信息 */
  msg: string
  /** 错误级别(可空) */
  level?: string | null
  /** 业务数据 */
  data: T
}

/**
 * 分页请求基类,对齐后端 `PageParam`
 *
 * 列表查询接口可 `extends IPageParam` 追加业务筛选字段。
 */
export interface IPageParam {
  /** 页码,从 1 开始 */
  pageNum: number
  /** 每页条数,最大 200 */
  pageSize: number
  /** 是否查询总条数 */
  searchCount?: boolean
}

/**
 * 分页结果,对齐后端 `PageResult<T>`
 */
export interface IPageResult<T> {
  /** 当前页 */
  pageNum: number
  /** 每页的数量 */
  pageSize: number
  /** 总记录数 */
  total: number
  /** 总页数 */
  pages: number
  /** 结果集 */
  list: T[]
  /** 是否为空 */
  emptyFlag: boolean
}
