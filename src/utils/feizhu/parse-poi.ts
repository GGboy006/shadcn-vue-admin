import type { PoiOffer } from './types'

import { asRecord, pickString } from './json'
import { pickJumpUrl } from './jump-url'

const POI_NAME = /门票|景点|景区|公园/

function formatPoiPrice(raw: string, freeHint: string): string {
  if (/免费/.test(raw) || /免费/.test(freeHint))
    return raw || '免费'
  if (!raw)
    return freeHint.includes('免费') ? '免费' : ''
  if (/[¥￥]|免费/.test(raw))
    return raw
  if (/^\d+(?:\.\d+)?$/.test(raw))
    return `¥${raw}`
  return raw
}

export function isPoiItem(obj: Record<string, unknown>): boolean {
  const name = pickString(obj, ['name', 'poiName', 'title', 'scenicName'])
  return Boolean(
    obj.ticketInfo
    || pickString(obj, ['freePoiStatus', 'ticketName', 'ticketType'])
    || POI_NAME.test(name),
  )
}

export function parsePoiItem(raw: unknown): PoiOffer | null {
  const obj = asRecord(raw)
  if (!obj || !isPoiItem(obj))
    return null

  const jumpUrl = pickJumpUrl(obj)
  if (!jumpUrl)
    return null

  const name = pickString(obj, ['name', 'poiName', 'title', 'scenicName'])
  if (!name)
    return null

  const freeHint = pickString(obj, ['freeHint', 'freePoiStatus', 'freeTag'])
  return {
    name,
    coverUrl: pickString(obj, ['coverUrl', 'cover', 'mainPic', 'picUrl', 'image', 'img', 'poster']),
    ticketName: pickString(obj, ['ticketName', 'ticketType', 'ticketInfo']),
    address: pickString(obj, ['address', 'addr', 'location']),
    freeHint,
    dateText: pickString(obj, ['dateText', 'ticketDate', 'date']),
    priceText: formatPoiPrice(pickString(obj, ['priceText', 'price', 'lowestPrice', 'priceYuan']), freeHint),
    jumpUrl,
  }
}
