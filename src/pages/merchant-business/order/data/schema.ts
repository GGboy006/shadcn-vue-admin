import type { IOrderDetailVO, IOrderListVO } from '@/services/api/merchant-business.api'

/** 订单列表行类型(文档 6.1) */
export type Order = IOrderListVO
/** 订单详情类型(文档 6.2) */
export type OrderDetail = IOrderDetailVO
