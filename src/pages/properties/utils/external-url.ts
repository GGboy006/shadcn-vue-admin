/**
 * 归一化物业外部链接。
 *
 * 历史数据可能只存了 `example.com` 这种没有协议的值,直接当 href 会被浏览器
 * 当成站内相对路径,表现为「点了还留在后台」;同时拦掉 javascript: 这类危险协议。
 *
 * @param url 后端返回的外部链接
 * @returns 可直接用于 href 的绝对地址;未配置或非法时返回 undefined
 */
export function resolveExternalUrl(url?: string | null): string | undefined {
  const trimmed = url?.trim()
  if (!trimmed)
    return undefined

  if (/^https?:\/\//i.test(trimmed))
    return trimmed

  // 带其它协议前缀(javascript:、data: 等)一律不放行
  if (/^[a-z][\w+\-.]*:/i.test(trimmed))
    return undefined

  return `https://${trimmed}`
}
