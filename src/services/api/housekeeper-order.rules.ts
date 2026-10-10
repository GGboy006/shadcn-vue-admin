/** 站长服务订单台按钮规则用到的字段(对接文档 §6.2 / §7.3 / §8) */
export interface HousekeeperOrderActionFields {
  /** 履约方编码:LOCAL 本站,其它为第三方 */
  fulfillProviderCode?: string | null
  /** 下单时抄写的支付方式:1 线上 / 2 线下。空不要当成线下 */
  payMode?: 1 | 2 | null
  /** 订单状态:0 待接单 … 6 已拒单 */
  orderStatus: number
  /** 订单支付状态:0 未支付 / 1 支付中 / 2 已支付 / 3 已退款 / 4 部分退款 */
  payStatus?: number | null
  /** 实付金额 */
  payAmount?: number | null
  /** 订单金额 */
  totalAmount?: number | null
}

/** 本站履约(空或 LOCAL);第三方如 ZMN 不可取消/改派 */
export function isLocalFulfill(code?: string | null): boolean {
  return !code || code === 'LOCAL'
}

/** 已支付且金额 > 0:站长取消会被拒,应引导居民 App 退款 */
export function isPaidWithAmount(order: HousekeeperOrderActionFields): boolean {
  if (order.payStatus !== 2)
    return false
  return Number(order.payAmount ?? 0) > 0 || Number(order.totalAmount ?? 0) > 0
}

/** 取消:本站 + 状态 ∈ {0,1,2,3}。线下单可取消且不退款；线上已支付且有金额则交给居民 App */
export function canCancelHousekeeperOrder(order: HousekeeperOrderActionFields): boolean {
  if (!isLocalFulfill(order.fulfillProviderCode))
    return false
  if (![0, 1, 2, 3].includes(order.orderStatus))
    return false
  if (order.payMode === 2)
    return true
  return !isPaidWithAmount(order)
}

/** 改派:本站 + 状态 ∈ {0,1} */
export function canReassignHousekeeperOrder(order: HousekeeperOrderActionFields): boolean {
  if (!isLocalFulfill(order.fulfillProviderCode))
    return false
  return order.orderStatus === 0 || order.orderStatus === 1
}
