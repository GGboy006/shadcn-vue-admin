import type { IHousekeeperStaff } from '@/services/api/housekeeper.api'

import type { IPageResult, IResponse } from '../types/response.type'
import type {
  IHousekeeperOrder,
  IHousekeeperOrderCancelDTO,
  IHousekeeperOrderDetail,
  IHousekeeperOrderPageQuery,
  IHousekeeperOrderReassignDTO,
} from './housekeeper-order.api'

import { normalizeHousekeeperOrderPage } from './housekeeper-order.page'
import { canCancelHousekeeperOrder, canReassignHousekeeperOrder } from './housekeeper-order.rules'

const MOCK_STATE_KEY = 'housekeeper-order-mock-state'

/** 改派下拉:真实单里出现的师傅 + 同馆一名备用师傅 */
const MOCK_STAFF: IHousekeeperStaff[] = [
  { staffId: '2090373993134673921', housekeeperId: '2087730522010886148', staffName: '郑阿姨', phone: '13723200664' },
  { staffId: '2090373993134673999', housekeeperId: '2087730522010886148', staffName: '刘阿姨', phone: '13723200674' },
  { staffId: '2094300200000000001', housekeeperId: '2087730522010886149', staffName: '何阿姨', phone: '13723200665' },
  { staffId: '2094300200000000002', housekeeperId: '2087730522010886149', staffName: '孙阿姨', phone: '13723200675' },
  { staffId: '2094300200000000014', housekeeperId: '2087730522010886152', staffName: '高师傅', phone: '13723200668' },
  { staffId: '2094300200000000013', housekeeperId: '2087730522010886152', staffName: '罗师傅', phone: '13723200678' },
]

/** 有数据账号 `/housekeeper/order/page` 原样 5 条 */
const SEED_ORDERS: IHousekeeperOrder[] = [
  {
    orderId: '2096192226822606849',
    orderNo: 'ORD20260905190226f00447',
    itemName: '郑阿姨',
    categoryName: '家政服务',
    housekeeperId: '2087730522010886148',
    housekeeperName: '家政服务公司',
    staffId: '2090373993134673921',
    staffName: '郑阿姨',
    assignMode: 1,
    residentNickname: '17600410044',
    residentPhone: '17600410044',
    contactName: '大宝贝女儿',
    contactPhone: '17600410044',
    serviceAddress: '康营家园17区6号楼一单元302',
    appointmentTime: '2026-09-05 19:00:00',
    totalAmount: 0.01,
    payAmount: null,
    payStatus: 0,
    payStatusLabel: '未支付',
    orderStatus: 0,
    orderStatusLabel: '待接单',
    fulfillProviderCode: 'LOCAL',
    createTime: '2026-09-05 19:02:27',
  },
  {
    orderId: '2095057763401162754',
    orderNo: 'ORD20260902155429ee6918',
    itemName: '何阿姨',
    categoryName: '保洁',
    housekeeperId: '2087730522010886149',
    housekeeperName: '保洁服务公司',
    staffId: '2094300200000000001',
    staffName: '何阿姨',
    assignMode: 1,
    residentNickname: '17600410044',
    residentPhone: '17600410044',
    contactName: null,
    contactPhone: null,
    serviceAddress: '金辉大厦',
    appointmentTime: '2026-09-02 15:54:00',
    totalAmount: 60,
    payAmount: null,
    payStatus: 0,
    payStatusLabel: '未支付',
    orderStatus: 0,
    orderStatusLabel: '待接单',
    fulfillProviderCode: 'LOCAL',
    createTime: '2026-09-02 15:54:30',
  },
  {
    orderId: '2094716443990122498',
    orderNo: 'ORD2026090117181280a405',
    itemName: '高师傅',
    categoryName: '管道疏通',
    housekeeperId: '2087730522010886152',
    housekeeperName: '管道疏通公司',
    staffId: '2094300200000000014',
    staffName: '高师傅',
    assignMode: 1,
    residentNickname: '17600410044',
    residentPhone: '17600410044',
    contactName: null,
    contactPhone: null,
    serviceAddress: '北京市北京市',
    appointmentTime: '2026-09-01 17:17:00',
    totalAmount: 80,
    payAmount: null,
    payStatus: 0,
    payStatusLabel: '未支付',
    orderStatus: 5,
    orderStatusLabel: '已取消',
    fulfillProviderCode: 'LOCAL',
    createTime: '2026-09-01 17:18:13',
  },
  {
    orderId: '2094698095197773825',
    orderNo: 'ORD20260901160518869757',
    itemName: '罗师傅',
    categoryName: '管道疏通',
    housekeeperId: '2087730522010886152',
    housekeeperName: '管道疏通公司',
    staffId: '2094300200000000013',
    staffName: '罗师傅',
    assignMode: 1,
    residentNickname: '17600410044',
    residentPhone: '17600410044',
    contactName: null,
    contactPhone: null,
    serviceAddress: '北京',
    appointmentTime: '2026-09-01 16:05:00',
    totalAmount: 80,
    payAmount: null,
    payStatus: 0,
    payStatusLabel: '未支付',
    orderStatus: 5,
    orderStatusLabel: '已取消',
    fulfillProviderCode: 'LOCAL',
    createTime: '2026-09-01 16:05:18',
  },
  {
    orderId: '2',
    orderNo: 'ORD202608241508416b0e56',
    itemName: '郑阿姨',
    categoryName: '家政服务',
    housekeeperId: '2087730522010886148',
    housekeeperName: '家政服务公司',
    staffId: '2090373993134673921',
    staffName: '郑阿姨',
    assignMode: 1,
    residentNickname: '腊先生',
    residentPhone: '15127176522',
    contactName: '联系人',
    contactPhone: '联系电话',
    serviceAddress: '服务地址',
    appointmentTime: '2026-08-27 15:20:00',
    totalAmount: 60,
    payAmount: 60,
    payStatus: 2,
    payStatusLabel: '已支付',
    orderStatus: 4,
    orderStatusLabel: '已完成',
    fulfillProviderCode: 'LOCAL',
    createTime: '2026-08-24 15:08:42',
  },
]

let details: IHousekeeperOrderDetail[] | null = null

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function ok<T>(data: T): IResponse<T> {
  return { code: 0, msg: 'success', level: null, data }
}

function nowText(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function toDetail(order: IHousekeeperOrder): IHousekeeperOrderDetail {
  const detail: IHousekeeperOrderDetail = {
    ...clone(order),
    residentId: '17600410044',
    categoryId: order.housekeeperId,
    serviceDesc: order.itemName ? `预约 ${order.itemName}` : undefined,
    unitPrice: order.totalAmount,
    quantity: 1,
    unit: '次',
    actualAmount: order.payAmount ?? order.totalAmount,
    remark: undefined,
    payments: [],
    evaluations: [],
    statusLogs: [
      {
        logId: `${order.orderId}-log-1`,
        fromStatus: null,
        toStatus: 0,
        operatorName: order.residentNickname,
        operatorType: 1,
        remark: '居民下单',
        createTime: order.createTime,
      },
    ],
  }

  if (order.orderStatus === 5) {
    detail.cancelTime = order.createTime
    detail.cancelReason = '演示数据：已取消订单'
    detail.cancelBy = 3
    detail.statusLogs?.push({
      logId: `${order.orderId}-log-cancel`,
      fromStatus: 0,
      toStatus: 5,
      operatorName: '站长',
      operatorType: 3,
      remark: '已取消',
      createTime: order.createTime,
    })
  }

  if (order.orderStatus === 4) {
    detail.payChannel = 1
    detail.payTime = '2026-08-24 15:10:00'
    detail.acceptTime = '2026-08-24 15:20:00'
    detail.serviceStartTime = '2026-08-27 15:20:00'
    detail.serviceEndTime = '2026-08-27 16:10:00'
    detail.confirmTime = '2026-08-27 16:20:00'
    detail.payments = [
      {
        paymentId: `${order.orderId}-pay-1`,
        paymentNo: 'PAY20260824151000',
        paymentScene: 1,
        channel: 1,
        amount: 60,
        payStatus: 2,
        payStatusLabel: '成功',
        thirdTradeNo: 'wx-demo-241508',
        payTime: '2026-08-24 15:10:00',
        createTime: '2026-08-24 15:08:50',
      },
    ]
    detail.evaluations = [
      {
        evaluationId: `${order.orderId}-ev-1`,
        evaluatorType: 1,
        evaluatorName: '腊先生',
        score: 5,
        serviceAttitudeScore: 5,
        serviceQualityScore: 5,
        serviceSpeedScore: 4,
        content: '服务准时，打扫干净。',
        isAnonymous: 0,
        createTime: '2026-08-27 16:25:00',
      },
    ]
    detail.statusLogs = [
      { logId: `${order.orderId}-l1`, fromStatus: null, toStatus: 0, operatorName: '腊先生', operatorType: 1, remark: '居民下单', createTime: '2026-08-24 15:08:42' },
      { logId: `${order.orderId}-l2`, fromStatus: 0, toStatus: 1, operatorName: '郑阿姨', operatorType: 2, remark: '师傅接单', createTime: '2026-08-24 15:20:00' },
      { logId: `${order.orderId}-l3`, fromStatus: 1, toStatus: 2, operatorName: '郑阿姨', operatorType: 2, remark: '开始服务', createTime: '2026-08-27 15:20:00' },
      { logId: `${order.orderId}-l4`, fromStatus: 2, toStatus: 3, operatorName: '郑阿姨', operatorType: 2, remark: '工人完成', createTime: '2026-08-27 16:10:00' },
      { logId: `${order.orderId}-l5`, fromStatus: 3, toStatus: 4, operatorName: '腊先生', operatorType: 1, remark: '居民确认完成', createTime: '2026-08-27 16:20:00' },
    ]
  }

  return detail
}

function readSession(key: string): string | null {
  if (typeof sessionStorage === 'undefined')
    return null
  return sessionStorage.getItem(key)
}

function writeSession(key: string, value: string) {
  if (typeof sessionStorage === 'undefined')
    return
  sessionStorage.setItem(key, value)
}

function persistDetails() {
  if (details)
    writeSession(MOCK_STATE_KEY, JSON.stringify(details))
}

export function resetMockHousekeeperOrders() {
  details = SEED_ORDERS.map(toDetail)
  persistDetails()
}

function getDetails(): IHousekeeperOrderDetail[] {
  if (details)
    return details
  const saved = readSession(MOCK_STATE_KEY)
  if (saved) {
    try {
      details = JSON.parse(saved) as IHousekeeperOrderDetail[]
      return details
    }
    catch {
      // 损坏则回种子
    }
  }
  resetMockHousekeeperOrders()
  return details ?? []
}

function toListItem(detail: IHousekeeperOrderDetail): IHousekeeperOrder {
  const {
    residentId: _residentId,
    residentUserId: _residentUserId,
    categoryId: _categoryId,
    serviceDesc: _serviceDesc,
    serviceImages: _serviceImages,
    unitPrice: _unitPrice,
    quantity: _quantity,
    unit: _unit,
    actualAmount: _actualAmount,
    payChannel: _payChannel,
    payTime: _payTime,
    acceptTime: _acceptTime,
    serviceStartTime: _serviceStartTime,
    serviceEndTime: _serviceEndTime,
    confirmTime: _confirmTime,
    cancelTime: _cancelTime,
    cancelReason: _cancelReason,
    cancelBy: _cancelBy,
    servicePersonPhone: _servicePersonPhone,
    remark: _remark,
    payments: _payments,
    evaluations: _evaluations,
    statusLogs: _statusLogs,
    ...list
  } = detail
  return list
}

export async function mockHousekeeperOrderPage(query: IHousekeeperOrderPageQuery): Promise<IResponse<IPageResult<IHousekeeperOrder>>> {
  const all = getDetails().map(toListItem)
  const keyword = query.keyword?.trim().toLowerCase()
  const filtered = all.filter((item) => {
    if (query.orderStatus !== undefined && item.orderStatus !== query.orderStatus)
      return false
    if (query.payStatus !== undefined && item.payStatus !== query.payStatus)
      return false
    if (query.housekeeperId && item.housekeeperId !== query.housekeeperId)
      return false
    if (query.createTimeBegin && (item.createTime ?? '') < query.createTimeBegin)
      return false
    if (query.createTimeEnd && (item.createTime ?? '') > query.createTimeEnd)
      return false
    if (!keyword)
      return true
    const hay = [
      item.orderNo,
      item.itemName,
      item.staffName,
      item.housekeeperName,
      item.contactName,
      item.contactPhone,
      item.residentNickname,
      item.residentPhone,
      item.serviceAddress,
    ].join(' ').toLowerCase()
    return hay.includes(keyword)
  })

  const pageNum = query.pageNum || 1
  const pageSize = query.pageSize || 10
  const start = (pageNum - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)

  return ok(normalizeHousekeeperOrderPage({
    pageNum,
    pageSize,
    total: filtered.length,
    pages: Math.max(1, Math.ceil(filtered.length / pageSize) || 1),
    list,
    emptyFlag: list.length === 0,
  }))
}

export async function mockHousekeeperOrderDetail(orderId?: string): Promise<IResponse<IHousekeeperOrderDetail>> {
  const found = getDetails().find(item => item.orderId === orderId)
  if (!found)
    throw new Error('订单不存在或无权查看')
  return ok(clone(found))
}

export async function mockCancelHousekeeperOrder(orderId: string, body: IHousekeeperOrderCancelDTO = {}): Promise<IResponse<boolean>> {
  const found = getDetails().find(item => item.orderId === orderId)
  if (!found)
    throw new Error('订单不存在或无权查看')
  if (!canCancelHousekeeperOrder(found))
    throw new Error(found.payStatus === 2 ? '已支付订单请由居民在 App 取消以触发退款' : '当前订单状态不允许取消')

  found.orderStatus = 5
  found.orderStatusLabel = '已取消'
  found.cancelTime = nowText()
  found.cancelReason = body.cancelReason?.trim() || undefined
  found.cancelBy = 3
  found.statusLogs = [
    ...(found.statusLogs ?? []),
    {
      logId: `${found.orderId}-log-${Date.now()}`,
      fromStatus: 0,
      toStatus: 5,
      operatorName: '站长',
      operatorType: 3,
      remark: found.cancelReason || '站长取消',
      createTime: found.cancelTime,
    },
  ]
  persistDetails()
  return ok(true)
}

export async function mockReassignHousekeeperOrder(orderId: string, body: IHousekeeperOrderReassignDTO): Promise<IResponse<boolean>> {
  const found = getDetails().find(item => item.orderId === orderId)
  if (!found)
    throw new Error('订单不存在或无权查看')
  if (!canReassignHousekeeperOrder(found))
    throw new Error('仅待接单或已接单可改派')
  if (!body.staffId)
    throw new Error('服务人员不能为空')

  const staff = MOCK_STAFF.find(item => item.staffId === body.staffId)
  if (!staff || staff.housekeeperId !== found.housekeeperId)
    throw new Error('服务人员不存在或不属于该管家服务')

  const sameStaff = staff.staffId === found.staffId
  const sameTime = !body.appointmentTime || body.appointmentTime === found.appointmentTime
  if (sameStaff && sameTime)
    throw new Error('目标人员与当前相同')

  const fromName = found.staffName || '未指定'
  found.staffId = staff.staffId
  found.staffName = staff.staffName
  found.itemName = staff.staffName
  found.assignMode = 1
  found.orderStatus = 0
  found.orderStatusLabel = '待接单'
  found.acceptTime = undefined
  if (body.appointmentTime)
    found.appointmentTime = body.appointmentTime
  found.statusLogs = [
    ...(found.statusLogs ?? []),
    {
      logId: `${found.orderId}-log-${Date.now()}`,
      fromStatus: 1,
      toStatus: 0,
      operatorName: '站长',
      operatorType: 3,
      remark: body.remark?.trim() || `站长改派 ${fromName} → ${staff.staffName}`,
      createTime: nowText(),
    },
  ]
  persistDetails()
  return ok(true)
}
