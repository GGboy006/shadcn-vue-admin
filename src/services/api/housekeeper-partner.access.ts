import { ofetch } from 'ofetch'
import { ref } from 'vue'

import { API_BASE_URL } from '@/constants/app-config'

/** 本地馆长调用合作方人员接口时的固定文案 */
export const PARTNER_STAFF_DENIED = '仅合作方可维护人员'

export type HousekeeperAccountKind = 'local' | 'partner'

const kind = ref<HousekeeperAccountKind | null>(null)
let task: Promise<HousekeeperAccountKind | null> | null = null

export function housekeeperKind() {
  return kind
}

export function clearHousekeeperKind() {
  kind.value = null
  task = null
}

export function classifyPartnerProbe(body: unknown): HousekeeperAccountKind | 'unknown' {
  if (!body || typeof body !== 'object')
    return 'unknown'
  const record = body as { code?: unknown, msg?: unknown }
  const msg = String(record.msg ?? '')
  if (record.code === 0)
    return 'partner'
  if (msg.includes(PARTNER_STAFF_DENIED))
    return 'local'
  return 'unknown'
}

async function requestPartnerStaff(token: string) {
  return await ofetch('/housekeeper/partner/staff', {
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
    ignoreResponseError: true,
  })
}

/** 静默区分合作方和本地馆。失败不改判定，下次进入再试。 */
export async function ensureHousekeeperKind(token: string) {
  if (kind.value)
    return kind.value
  if (!token)
    return null
  if (!task) {
    task = requestPartnerStaff(token)
      .then((body) => {
        const next = classifyPartnerProbe(body)
        if (next === 'unknown')
          return null
        kind.value = next
        return next
      })
      .catch(() => null)
      .finally(() => {
        task = null
      })
  }
  return await task
}
