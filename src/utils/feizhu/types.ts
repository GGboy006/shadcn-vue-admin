export interface TrainTrip {
  trainNo: string
  transportName: string
  seatClass: string
  journeyType: string
  depTime: string
  arrTime: string
  depStation: string
  arrStation: string
  durationText: string
  transferText: string
  plusDay: boolean
  dateText: string
  priceText: string
  jumpUrl: string
}

export interface HotelOffer {
  name: string
  coverUrl: string
  scoreText: string
  star: string
  address: string
  poiHint: string
  review: string
  priceText: string
  jumpUrl: string
}

export interface PoiOffer {
  name: string
  coverUrl: string
  ticketName: string
  address: string
  freeHint: string
  dateText: string
  priceText: string
  jumpUrl: string
}

export interface FlyCardsAfterText {
  trains: TrainTrip[]
  hotels: HotelOffer[]
  pois: PoiOffer[]
}

export function emptyFlyCards(): FlyCardsAfterText {
  return { trains: [], hotels: [], pois: [] }
}

export function hasFlyCards(cards?: FlyCardsAfterText | null): boolean {
  if (!cards)
    return false
  return cards.trains.length > 0 || cards.hotels.length > 0 || cards.pois.length > 0
}
