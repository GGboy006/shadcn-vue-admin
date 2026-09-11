const FLY_HOST = /feizhu|fliggy|alitrip/i

export function pickJumpUrl(obj: Record<string, unknown> | null | undefined): string {
  if (!obj)
    return ''
  const candidates = [obj.detailUrl, obj.jumpUrl, obj.url, obj.h5Url]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && isFlyJumpUrl(candidate))
      return candidate.trim()
  }
  return ''
}

export function isFlyJumpUrl(url: string): boolean {
  return FLY_HOST.test(url.trim())
}

export function distinctByJumpUrl<T extends { jumpUrl: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []
  for (const item of items) {
    const key = item.jumpUrl.trim()
    if (!key || seen.has(key))
      continue
    seen.add(key)
    result.push(item)
  }
  return result
}
