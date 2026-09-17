/** 时间展示:对接文档为 `yyyy-MM-dd HH:mm:ss` */
export function formatDateTime(value?: string | null): string {
  if (!value)
    return '-'
  return value.replace('T', ' ').slice(0, 19)
}
