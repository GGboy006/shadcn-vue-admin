/** 时间展示:对接文档为 `yyyy-MM-dd HH:mm:ss` */
export function formatDateTime(value?: string | null): string {
  if (!value)
    return '-'
  return value.replace('T', ' ').slice(0, 19)
}

/** 金额展示(元) */
export function formatYuan(value?: number | null): string {
  if (value == null || Number.isNaN(Number(value)))
    return '-'
  return `¥${Number(value).toFixed(2)}`
}
