import type { HotelOffer } from './types'

import { asRecord, pickString } from './json'
import { pickJumpUrl } from './jump-url'

function formatPrice(raw: string): string {
  if (!raw)
    return ''
  if (/[¥￥晚起]/.test(raw))
    return raw
  if (/^\d+(?:\.\d+)?$/.test(raw))
    return `¥${raw}/晚`
  return raw
}

function formatScore(raw: string): string {
  if (!raw)
    return ''
  if (/分|评分/.test(raw))
    return raw
  if (/^\d+(?:\.\d+)?$/.test(raw))
    return `${raw}分`
  return raw
}

function pickCover(obj: Record<string, unknown>): string {
  const direct = pickString(obj, ['coverUrl', 'cover', 'mainPic', 'picUrl', 'image', 'img', 'poster', 'imageUrl'])
  if (direct)
    return direct
  const pics = obj.pics ?? obj.images ?? obj.picList
  if (!Array.isArray(pics) || pics.length === 0)
    return ''
  const first = pics[0]
  if (typeof first === 'string')
    return first
  return pickString(asRecord(first), ['url', 'picUrl', 'src', 'image'])
}

export function isHotelItem(obj: Record<string, unknown>): boolean {
  return Boolean(
    pickString(obj, ['shId', 'star', 'scoreDesc', 'scoreText', 'interestsPoi', 'brandName'])
    || pickString(obj, ['hotelName']),
  )
}

export function parseHotelItem(raw: unknown): HotelOffer | null {
  const obj = asRecord(raw)
  if (!obj)
    return null

  const jumpUrl = pickJumpUrl(obj)
  if (!jumpUrl)
    return null

  const name = pickString(obj, ['name', 'hotelName', 'title', 'hotelTitle', 'itemName', 'storeName', 'brandName'])
  if (!name)
    return null

  return {
    name,
    coverUrl: pickCover(obj),
    scoreText: formatScore(pickString(obj, ['scoreText', 'scoreDesc', 'score', 'rate', 'commentScore'])),
    star: pickString(obj, ['star', 'starType', 'brandName', 'hotelStar']),
    address: pickString(obj, ['address', 'addr', 'location']),
    poiHint: pickString(obj, ['poiHint', 'interestsPoi', 'poiName']),
    review: pickString(obj, ['review', 'comment', 'commentDesc']),
    priceText: formatPrice(pickString(obj, ['priceText', 'price', 'lowestPrice', 'priceYuan', 'minPrice'])),
    jumpUrl,
  }
}
