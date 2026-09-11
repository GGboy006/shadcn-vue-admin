import type { HotelOffer, PoiOffer, TrainTrip } from './types'

import { isFlyJumpUrl } from './jump-url'
import { emptyFlyCards } from './types'

const BOOK_RE = /\[Click to book\]\((https?:[^)\s]+)\)/gi
const TRAIN_NO_RE = /[GDCZKT]\d{2,5}/
const POI_RE = /门票|景点|景区|公园/
const PRICE_RE = /[¥￥]\s*\d+(?:\.\d+)?(?:\s*\/\s*晚)?/

function stripHeadingMarks(line: string): string {
  let text = line
  while (text.startsWith('#'))
    text = text.slice(1)
  text = text.trim()
  if (text.startsWith('**') && text.endsWith('**') && text.length > 4)
    text = text.slice(2, -2).trim()
  return stripNumberPrefix(text)
}

function stripNumberPrefix(text: string): string {
  let index = 0
  while (index < text.length && text[index] >= '0' && text[index] <= '9')
    index += 1
  if (index === 0)
    return text
  const sep = text[index]
  if (sep !== '.' && sep !== '、')
    return text
  index += 1
  while (index < text.length && (text[index] === ' ' || text[index] === '\t'))
    index += 1
  return text.slice(index) || text
}

function isHeadingLine(line: string): boolean {
  if (line.startsWith('#') || line.startsWith('**'))
    return true
  const first = line[0]
  return first >= '0' && first <= '9' && (line.includes('. ') || line.includes('、'))
}

function headingBefore(text: string, index: number): string {
  const before = text.slice(0, index)
  const lines = before.split('\n').map(line => line.trim()).filter(Boolean)
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    if (isHeadingLine(line))
      return stripHeadingMarks(line)
  }
  return lines.at(-1) ?? ''
}

function priceBefore(text: string, index: number): string {
  const window = text.slice(Math.max(0, index - 400), index)
  return window.match(PRICE_RE)?.[0]?.replace(/\s+/g, '') ?? ''
}

/** 工具 JSON 未落库时，从助手正文 Click to book 还原飞猪卡 */
export function recoverFlyCardsFromMarkdown(markdown: string): { trains: TrainTrip[], hotels: HotelOffer[], pois: PoiOffer[] } {
  const result = emptyFlyCards()
  if (!markdown)
    return result

  const seen = new Set<string>()
  for (const match of markdown.matchAll(BOOK_RE)) {
    const jumpUrl = match[1]?.trim() ?? ''
    if (!isFlyJumpUrl(jumpUrl) || seen.has(jumpUrl))
      continue
    seen.add(jumpUrl)

    const index = match.index ?? 0
    const name = headingBefore(markdown, index)
    if (!name)
      continue
    const priceText = priceBefore(markdown, index)

    if (TRAIN_NO_RE.test(name) || /列车|火车|高铁/.test(name)) {
      result.trains.push({
        trainNo: name.match(TRAIN_NO_RE)?.[0] ?? name,
        transportName: '',
        seatClass: '',
        journeyType: '',
        depTime: '',
        arrTime: '',
        depStation: '',
        arrStation: '',
        durationText: '',
        transferText: '',
        plusDay: false,
        dateText: '',
        priceText,
        jumpUrl,
      })
      continue
    }

    if (POI_RE.test(name)) {
      result.pois.push({
        name,
        coverUrl: '',
        ticketName: '',
        address: '',
        freeHint: '',
        dateText: '',
        priceText: priceText || (/免费/.test(name) ? '免费' : ''),
        jumpUrl,
      })
      continue
    }

    result.hotels.push({
      name,
      coverUrl: '',
      scoreText: '',
      star: '',
      address: '',
      poiHint: '',
      review: '',
      priceText,
      jumpUrl,
    })
  }

  return result
}
