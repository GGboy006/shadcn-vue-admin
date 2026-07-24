import dayjs from 'dayjs'

import type { IActivityAddReq, IActivityUpdateReq } from '@/services/api/merchant-business.api'

import type { ActivityFormValues } from './schema'

/** 活动表单可选字段列表(除 name/startTime/endTime 外) */
const OPTIONAL_FIELDS = [
  'poster',
  'detailPoster',
  'sponsorName',
  'cateCode',
  'cateName',
  'describes',
  'content',
  'address',
  'isCharge',
  'salePrice',
  'torder',
  'isRecommend',
  'isEnable',
] as const

/**
 * 将 datetime-local 输入值格式化为后端 LocalDateTime 接受的 `yyyy-MM-dd HH:mm:ss`。
 *
 * datetime-local 控件产出 `2026-07-24T16:43`(无秒、带 T),
 * 后端 Jackson 默认不认,需补秒并把 T 换成空格。
 * 已格式化或带秒的 ISO 串也能兼容(dayjs 统一解析)。
 */
export function formatActivityDateTime(value: string): string {
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 将后端返回的时间串反格式化为 `datetime-local` 控件所需的 `YYYY-MM-DDTHH:mm`。
 *
 * 后端返回 `2026-07-24 16:43:00`(带空格),datetime-local 控件只认 `2026-07-24T16:43`
 * (带 T、秒可选),不转换则编辑时无法回显。空值返回空串。
 */
export function toDateTimeLocalInput(value: string | undefined | null): string {
  if (!value) {
    return ''
  }
  return dayjs(value).format('YYYY-MM-DDTHH:mm')
}

/**
 * 构建活动新增/更新请求体。
 *
 * - 有 uniqueCode -> 更新(IActivityUpdateReq)
 * - 无 uniqueCode -> 新增(IActivityAddReq)
 * - name / startTime / endTime 必填
 * - endTime 不能早于 startTime
 * - startTime/endTime 统一格式化为 `yyyy-MM-dd HH:mm:ss`
 * - 可选字段为 undefined 时不写入
 */
export function buildActivityPayload(values: ActivityFormValues, uniqueCode?: string): IActivityAddReq | IActivityUpdateReq {
  if (!values.name.trim()) {
    throw new Error('活动名称不能为空')
  }
  if (!values.startTime) {
    throw new Error('开始时间不能为空')
  }
  if (!values.endTime) {
    throw new Error('结束时间不能为空')
  }
  if (new Date(values.endTime).getTime() < new Date(values.startTime).getTime()) {
    throw new Error('结束时间不能早于开始时间')
  }

  const base: Record<string, unknown> = {
    name: values.name,
    startTime: formatActivityDateTime(values.startTime),
    endTime: formatActivityDateTime(values.endTime),
  }
  OPTIONAL_FIELDS.forEach((field) => {
    const value = values[field]
    // undefined / null 都不写入:编辑回显后端可能对未填字段返回 null
    if (value !== undefined && value !== null) {
      base[field] = value
    }
  })

  if (uniqueCode) {
    return { uniqueCode, ...base } as unknown as IActivityUpdateReq
  }
  return base as unknown as IActivityAddReq
}
