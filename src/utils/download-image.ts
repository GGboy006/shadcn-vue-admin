/**
 * 图片下载工具
 *
 * 内部复用 `downloadFile`，通过后端代理接口下载 OSS 图片，
 * 解决浏览器直接请求 OSS 时的 CORS 跨域问题。
 *
 * @param url OSS 图片地址
 * @param filename 下载文件名（可选，不需要带扩展名）
 */
import { downloadFile } from './download-file'

export function downloadImage(url: string, filename?: string): void {
  if (!url)
    return

  downloadFile({
    url,
    fileName: filename ? `${filename}.png` : undefined,
  })
}
