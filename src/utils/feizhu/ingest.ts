import type { HotelOffer, PoiOffer, TrainTrip } from './types'

import { asRecord, collectItems, parseLooseJson } from './json'
import { parseHotelItem } from './parse-hotel'
import { parsePoiItem } from './parse-poi'
import { parseTrainItem } from './parse-train'
import { emptyFlyCards } from './types'

export function ingestFlyCards(content: unknown): { trains: TrainTrip[], hotels: HotelOffer[], pois: PoiOffer[] } {
  const parsed = parseLooseJson(content)
  const items = collectItems(parsed)
  const source = items.length > 0 ? items : (asRecord(parsed) ? [parsed] : [])
  const result = emptyFlyCards()

  for (const item of source) {
    const train = parseTrainItem(item)
    if (train) {
      result.trains.push(train)
      continue
    }
    const poi = parsePoiItem(item)
    if (poi) {
      result.pois.push(poi)
      continue
    }
    const hotel = parseHotelItem(item)
    if (hotel)
      result.hotels.push(hotel)
  }

  return result
}
