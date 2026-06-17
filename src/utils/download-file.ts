/**
 * 通用文件下载工具
 *
 * 通过后端代理接口 `/ossFile/download` 下载 OSS 文件，
 * 绕过浏览器直接请求 OSS 时的 CORS 限制。
 *
 * 后端接口返回 `Content-Disposition: attachment`，浏览器会自动触发下载。
 */

import { API_BASE_URL } from '@/constants/app-config'

export interface DownloadFileOptions {
  /** OSS 文件完整 URL */
  url: string
  /** 下载文件名（可选，不传则后端自动使用原始后缀或时间戳） */
  fileName?: string
}

/**
 * 构建后端代理下载 URL
 */
export function buildFileDownloadUrl(options: DownloadFileOptions): string {
  const { url, fileName } = options

  if (!url)
    throw new Error('[downloadFile] url is required')

  const params = new URLSearchParams()
  params.set('ossUrl', url)

  if (fileName)
    params.set('fileName', fileName)

  return `${API_BASE_URL}/ossFile/download?${params.toString()}`
}

/**
 * 触发文件下载
 *
 * 使用隐藏 iframe 发起 GET 请求，避免页面跳转或弹出新标签页。
 */
export function downloadFile(options: DownloadFileOptions): void {
  const downloadUrl = buildFileDownloadUrl(options)

  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = downloadUrl

  document.body.appendChild(iframe)

  // 下载触发后移除 iframe，避免 DOM 堆积
  setTimeout(() => {
    if (iframe.parentNode)
      document.body.removeChild(iframe)
  }, 30000)
}
