import type { IChatMessage } from '@/services/api/conversation.api'

import type { FlyCardsAfterText, HotelOffer, PoiOffer, TrainTrip } from './types'

import { getMessageText } from '../chat-message-parts'
import { collectToolContentsFromMessage } from './collect-tool-contents'
import { ingestFlyCards } from './ingest'
import { distinctByJumpUrl } from './jump-url'
import { recoverFlyCardsFromMarkdown } from './parse-markdown'
import { emptyFlyCards, hasFlyCards } from './types'

type MapperEvent
  = | { kind: 'user' }
    | { kind: 'text', messageId: string }
    | { kind: 'train', trip: TrainTrip }
    | { kind: 'hotel', hotel: HotelOffer }
    | { kind: 'poi', poi: PoiOffer }

const CLIENT_ROLES = new Set(['user', 'station_merchant'])
const TOOL_ROLES = new Set(['tool', 'tool_result'])

function isClient(msg: IChatMessage): boolean {
  return CLIENT_ROLES.has(msg.role)
}

function isAssistantLike(msg: IChatMessage): boolean {
  return !isClient(msg) && !TOOL_ROLES.has(msg.role.toLowerCase())
}

function sortMessages(messages: IChatMessage[]): IChatMessage[] {
  return [...messages].sort((a, b) => {
    const ta = Date.parse(a.createTime || '') || 0
    const tb = Date.parse(b.createTime || '') || 0
    if (ta !== tb)
      return ta - tb
    return 0
  })
}

class CardSink {
  private trainJumps = new Set<string>()
  private hotelJumps = new Set<string>()
  private poiJumps = new Set<string>()

  beginTurn() {
    this.trainJumps.clear()
    this.hotelJumps.clear()
    this.poiJumps.clear()
  }

  takeTrains(items: TrainTrip[]): TrainTrip[] {
    return this.filter(items, this.trainJumps)
  }

  takeHotels(items: HotelOffer[]): HotelOffer[] {
    return this.filter(items, this.hotelJumps)
  }

  takePois(items: PoiOffer[]): PoiOffer[] {
    return this.filter(items, this.poiJumps)
  }

  private filter<T extends { jumpUrl: string }>(items: T[], set: Set<string>): T[] {
    const accepted: T[] = []
    for (const item of items) {
      const key = item.jumpUrl.trim()
      if (!key || set.has(key))
        continue
      set.add(key)
      accepted.push(item)
    }
    return accepted
  }
}

function pushIngested(events: MapperEvent[], sink: CardSink, contents: unknown[]) {
  for (const content of contents) {
    const ingested = ingestFlyCards(content)
    for (const trip of sink.takeTrains(ingested.trains))
      events.push({ kind: 'train', trip })
    for (const poi of sink.takePois(ingested.pois))
      events.push({ kind: 'poi', poi })
    for (const hotel of sink.takeHotels(ingested.hotels))
      events.push({ kind: 'hotel', hotel })
  }
}

function recoverMissingTurns(events: MapperEvent[], texts: Map<string, string>) {
  let index = 0
  while (index < events.length) {
    if (events[index].kind === 'user') {
      index += 1
      continue
    }
    const start = index
    while (index < events.length && events[index].kind !== 'user')
      index += 1
    const slice = events.slice(start, index)
    const hasCard = slice.some(event => event.kind === 'train' || event.kind === 'hotel' || event.kind === 'poi')
    if (hasCard)
      continue

    const recovered = emptyFlyCards()
    for (const event of slice) {
      if (event.kind !== 'text')
        continue
      const extra = recoverFlyCardsFromMarkdown(texts.get(event.messageId) ?? '')
      recovered.trains.push(...extra.trains)
      recovered.hotels.push(...extra.hotels)
      recovered.pois.push(...extra.pois)
    }
    if (!hasFlyCards(recovered))
      continue

    const extras: MapperEvent[] = [
      ...distinctByJumpUrl(recovered.trains).map(trip => ({ kind: 'train' as const, trip })),
      ...distinctByJumpUrl(recovered.pois).map(poi => ({ kind: 'poi' as const, poi })),
      ...distinctByJumpUrl(recovered.hotels).map(hotel => ({ kind: 'hotel' as const, hotel })),
    ]
    events.splice(index, 0, ...extras)
    index += extras.length
  }
}

function mergeInto(target: FlyCardsAfterText, next: FlyCardsAfterText) {
  target.trains.push(...next.trains)
  target.hotels = distinctByJumpUrl([...target.hotels, ...next.hotels])
  target.pois = distinctByJumpUrl([...target.pois, ...next.pois])
}

function collapseFlyCarousels(events: MapperEvent[]): Map<string, FlyCardsAfterText> {
  const map = new Map<string, FlyCardsAfterText>()
  let lastTextId: string | null = null
  const buffer = emptyFlyCards()

  function flush(messageId: string | null) {
    if (!messageId || !hasFlyCards(buffer))
      return
    const current = map.get(messageId) ?? emptyFlyCards()
    mergeInto(current, {
      trains: buffer.trains.splice(0),
      hotels: buffer.hotels.splice(0),
      pois: buffer.pois.splice(0),
    })
    map.set(messageId, current)
  }

  for (const event of events) {
    if (event.kind === 'user') {
      flush(lastTextId)
      lastTextId = null
      continue
    }
    if (event.kind === 'text') {
      lastTextId = event.messageId
      continue
    }
    if (event.kind === 'train')
      buffer.trains.push(event.trip)
    else if (event.kind === 'hotel')
      buffer.hotels.push(event.hotel)
    else
      buffer.pois.push(event.poi)
  }
  flush(lastTextId)
  return map
}

/** 会话级历史回放：按轮 jumpUrl 去重，酒景合并到正文下方 */
export function mapFlyCardsByMessageId(messages: IChatMessage[]): Map<string, FlyCardsAfterText> {
  const sorted = sortMessages(messages)
  const events: MapperEvent[] = []
  const texts = new Map<string, string>()
  const sink = new CardSink()
  sink.beginTurn()

  for (const msg of sorted) {
    if (isClient(msg)) {
      events.push({ kind: 'user' })
      sink.beginTurn()
      continue
    }

    pushIngested(events, sink, collectToolContentsFromMessage(msg))

    if (!isAssistantLike(msg))
      continue

    const text = getMessageText(msg)
    if (text) {
      texts.set(msg.id, text)
      events.push({ kind: 'text', messageId: msg.id })
    }
  }

  recoverMissingTurns(events, texts)
  return collapseFlyCarousels(events)
}
