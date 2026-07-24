import dayjs from 'dayjs'
import { ofetch } from 'ofetch'

import { API_BASE_URL } from '@/constants/app-config'

/** 生成导出文件名时间戳,格式 yyyyMMddHHmm */
export function formatExportTimestamp(date: Date = new Date()): string {
  return dayjs(date).format('YYYYMMDDHHmm')
}

/** 拼接导出文件名:{prefix}_{timestamp}.{ext} */
export function buildExportFilename(prefix: string, ext: string, date: Date = new Date()): string {
  const normalizedExt = ext.startsWith('.') ? ext.slice(1) : ext
  return `${prefix}_${formatExportTimestamp(date)}.${normalizedExt}`
}

/**
 * 拼接带 query 的完整下载 URL。
 *
 * 抽出为纯函数(显式传 base)便于测试;downloadFile 调用时传 API_BASE_URL。
 * 跳过 undefined / null / 空字符串的 query 值。
 */
export function buildDownloadUrl(base: string, path: string, query?: Record<string, unknown>): string {
  const url = new URL(`${base}${path}`)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value))
      }
    })
  }
  return url.toString()
}

/**
 * 带 token 的文件下载(blob)。
 *
 * @param path 以 / 开头的接口路径,如 `/merchant/order/M1/export`
 * @param filename 下载文件名(建议用 buildExportFilename 生成,含时间戳)
 * @param query 查询参数,会拼到 URL 上
 */
export async function downloadFile(path: string, filename: string, query?: Record<string, unknown>): Promise<void> {
  // 动态导入避免模块加载时触发 pinia setup(localStorage),保持纯函数测试友好
  const [{ default: pinia }, { useAuthStore }] = await Promise.all([
    import('@/plugins/pinia/setup'),
    import('@/stores/auth'),
  ])
  const authStore = useAuthStore(pinia)
  const url = buildDownloadUrl(API_BASE_URL, path, query)

  const blob = await ofetch(url, {
    method: 'GET',
    responseType: 'blob',
    headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {},
  }) as Blob

  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  a.click()
  URL.revokeObjectURL(blobUrl)
}
