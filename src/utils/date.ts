export function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr)
    return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}
