export const WEEKDAY_OPTIONS = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' },
] as const

const CLOCK_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/
const ONE_HOUR = 60 * 60

export interface BusinessHourIssue {
  path: 'openTime' | 'closeTime' | 'openDays'
  message: string
}

export interface AppointmentSlot {
  start: string
  end: string
  label: string
}

/** 不改时间时不带预约字段。只传了开始或结束也不提交，避免半档。 */
export function buildReassignPayload(input: {
  staffId: string
  appointmentTime?: string
  appointmentEndTime?: string
  remark?: string
}) {
  const body: {
    staffId: string
    appointmentTime?: string
    appointmentEndTime?: string
    remark?: string
  } = { staffId: input.staffId }
  const remark = input.remark?.trim()
  if (input.appointmentTime && input.appointmentEndTime) {
    body.appointmentTime = input.appointmentTime
    body.appointmentEndTime = input.appointmentEndTime
  }
  if (remark)
    body.remark = remark
  return body
}

export function parseOpenDays(value?: string | null): number[] {
  if (!value)
    return []
  const days = value
    .split(',')
    .map(item => Number(item.trim()))
    .filter(day => Number.isInteger(day) && day >= 1 && day <= 7)
  return [...new Set(days)].sort((left, right) => left - right)
}

export function formatOpenDays(days: number[]): string {
  return parseOpenDays(days.join(',')).join(',')
}

export function toggleOpenDay(current: string | undefined, day: number, selected: boolean): string {
  const days = new Set(parseOpenDays(current))
  if (selected)
    days.add(day)
  else
    days.delete(day)
  return formatOpenDays([...days])
}

function clockSeconds(value: string): number | undefined {
  if (!CLOCK_PATTERN.test(value))
    return undefined
  const [hour, minute, second] = value.split(':').map(Number)
  return hour * ONE_HOUR + minute * 60 + second
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function formatClock(totalSeconds: number) {
  const hour = Math.floor(totalSeconds / ONE_HOUR)
  const minute = Math.floor((totalSeconds % ONE_HOUR) / 60)
  return `${pad(hour)}:${pad(minute)}`
}

function formatDateTime(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function dateAtSeconds(date: string, totalSeconds: number): Date | undefined {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day)
    return undefined
  const result = new Date(year, month - 1, day, 0, 0, 0, 0)
  if (result.getFullYear() !== year || result.getMonth() !== month - 1 || result.getDate() !== day)
    return undefined
  result.setHours(0, 0, totalSeconds, 0)
  return result
}

export function weekdayOf(date: string): number | undefined {
  const parsed = dateAtSeconds(date, 0)
  if (!parsed)
    return undefined
  return parsed.getDay() === 0 ? 7 : parsed.getDay()
}

export function isOpenOnDate(date: string, openDays?: string | null): boolean {
  const weekday = weekdayOf(date)
  if (!weekday)
    return false
  return parseOpenDays(openDays).includes(weekday)
}

/** 本地馆营业时间。结束须晚于开始，窗口至少 1 小时。 */
export function localBusinessHourIssues(values: {
  openTime?: string | null
  closeTime?: string | null
  openDays?: string | null
}): BusinessHourIssue[] {
  const issues: BusinessHourIssue[] = []
  const openTime = values.openTime?.trim() ?? ''
  const closeTime = values.closeTime?.trim() ?? ''

  if (!openTime)
    issues.push({ path: 'openTime', message: '请选择营业开始时间' })
  else if (!CLOCK_PATTERN.test(openTime))
    issues.push({ path: 'openTime', message: '营业开始时间格式不正确' })

  if (!closeTime)
    issues.push({ path: 'closeTime', message: '请选择营业结束时间' })
  else if (!CLOCK_PATTERN.test(closeTime))
    issues.push({ path: 'closeTime', message: '营业结束时间格式不正确' })

  if (!parseOpenDays(values.openDays).length)
    issues.push({ path: 'openDays', message: '请至少选择一个营业日' })

  const open = clockSeconds(openTime)
  const close = clockSeconds(closeTime)
  if (open !== undefined && close !== undefined) {
    const span = close - open
    if (span <= 0)
      issues.push({ path: 'closeTime', message: '结束须晚于开始' })
    else if (span < ONE_HOUR)
      issues.push({ path: 'closeTime', message: '营业窗口至少 1 小时' })
  }

  return issues
}

/** 按营业窗口切 60 分钟档。开始早于「现在 + 60 分钟」的档不给出。 */
export function buildAppointmentSlots(input: {
  date: string
  openTime?: string | null
  closeTime?: string | null
  openDays?: string | null
  now?: Date
}): AppointmentSlot[] {
  if (!isOpenOnDate(input.date, input.openDays))
    return []
  const open = clockSeconds(input.openTime?.trim() ?? '')
  const close = clockSeconds(input.closeTime?.trim() ?? '')
  if (open === undefined || close === undefined || close - open < ONE_HOUR)
    return []

  const earliest = (input.now ?? new Date()).getTime() + ONE_HOUR * 1000
  const slots: AppointmentSlot[] = []
  for (let start = open; start + ONE_HOUR <= close; start += ONE_HOUR) {
    const startDate = dateAtSeconds(input.date, start)
    const endDate = dateAtSeconds(input.date, start + ONE_HOUR)
    if (!startDate || !endDate || startDate.getTime() < earliest)
      continue
    slots.push({
      start: formatDateTime(startDate),
      end: formatDateTime(endDate),
      label: `${formatClock(start)}–${formatClock(start + ONE_HOUR)}`,
    })
  }
  return slots
}
