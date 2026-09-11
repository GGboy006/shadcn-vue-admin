import type { TrainTrip } from './types'

import { asRecord, pickString } from './json'
import { pickJumpUrl } from './jump-url'

function shortStation(name: string): string {
  return name.replace(/站$/, '')
}

function asJourneys(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value))
    return []
  return value.map(asRecord).filter((item): item is Record<string, unknown> => item != null)
}

export function isTrainItem(obj: Record<string, unknown>): boolean {
  return asJourneys(obj.journeys).length > 0 || Boolean(pickString(obj, ['trainNo', 'trainCode']))
}

export function parseTrainItem(raw: unknown): TrainTrip | null {
  const obj = asRecord(raw)
  if (!obj || !isTrainItem(obj))
    return null

  const jumpUrl = pickJumpUrl(obj)
  if (!jumpUrl)
    return null

  const journeys = asJourneys(obj.journeys)
  const first = journeys[0] ?? obj
  const last = journeys[journeys.length - 1] ?? obj
  const trainNos = journeys
    .map(item => pickString(item, ['trainNo', 'trainCode']))
    .filter(Boolean)
  const trainNo = trainNos.join(' / ') || pickString(obj, ['trainNo', 'trainCode'])
  if (!trainNo)
    return null

  const plusRaw = pickString(obj, ['plusDay', 'arriveNextDay']) || pickString(last, ['plusDay'])
  const plusDay = plusRaw === 'true' || plusRaw === '1' || Number(plusRaw) > 0

  return {
    trainNo,
    transportName: pickString(obj, ['transportName', 'trainType', 'vehicleType']),
    seatClass: pickString(obj, ['seatClass', 'seat', 'seatName']),
    journeyType: pickString(obj, ['journeyType']) || (journeys.length > 1 ? '中转' : '直达'),
    depTime: pickString(first, ['depTime', 'departTime', 'startTime']),
    arrTime: pickString(last, ['arrTime', 'arriveTime', 'endTime']),
    depStation: shortStation(pickString(first, ['depStation', 'fromStation', 'departStation'])),
    arrStation: shortStation(pickString(last, ['arrStation', 'toStation', 'arriveStation'])),
    durationText: pickString(obj, ['durationText', 'duration', 'costTime']),
    transferText: pickString(obj, ['transferText', 'transfer']) || (journeys.length > 1 ? `换乘 ${journeys.length - 1} 次` : ''),
    plusDay,
    dateText: pickString(obj, ['dateText', 'date', 'depDate']),
    priceText: pickString(obj, ['priceText', 'price', 'lowestPrice']),
    jumpUrl,
  }
}
