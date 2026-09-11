export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return null
  return value as Record<string, unknown>
}

export function pickString(obj: Record<string, unknown> | null | undefined, keys: string[]): string {
  if (!obj)
    return ''
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'string' && value.trim())
      return value.trim()
    if (typeof value === 'number' && Number.isFinite(value))
      return String(value)
  }
  return ''
}

export function parseLooseJson(raw: unknown): unknown {
  if (raw == null)
    return null
  if (typeof raw !== 'string')
    return unwrapOnce(raw)

  const text = raw.trim()
  if (!text)
    return null

  const direct = tryParseJson(text)
  if (direct != null)
    return unwrapOnce(direct)

  const objectSlice = sliceJson(text, '{', '}')
  if (objectSlice != null)
    return unwrapOnce(objectSlice)

  const arraySlice = sliceJson(text, '[', ']')
  if (arraySlice != null)
    return unwrapOnce(arraySlice)

  return text
}

function unwrapOnce(value: unknown): unknown {
  if (typeof value === 'string') {
    const nested = tryParseJson(value.trim())
    return nested ?? value
  }
  return value
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  }
  catch {
    return null
  }
}

function sliceJson(text: string, open: '{' | '[', close: '}' | ']'): unknown {
  const start = text.indexOf(open)
  const end = text.lastIndexOf(close)
  if (start < 0 || end <= start)
    return null
  return tryParseJson(text.slice(start, end + 1))
}

const ITEM_KEYS = ['itemList', 'items', 'list', 'hotels', 'pois', 'trains', 'offers']

/** 从 tool JSON 中取出条目数组，兼容 data.itemList / items */
export function collectItems(value: unknown): unknown[] {
  const parsed = parseLooseJson(value)
  if (Array.isArray(parsed))
    return parsed

  const record = asRecord(parsed)
  if (!record)
    return []

  for (const key of ITEM_KEYS) {
    const list = record[key]
    if (Array.isArray(list) && list.length > 0)
      return list
  }

  const nested = parseLooseJson(record.data)
  if (nested && nested !== record)
    return collectItems(nested)

  return []
}
