/** 历史助手正文轻量规范化：标题降级、去掉多余分隔线和空「预订链接」标题 */
export function normalizeChatMarkdown(markdown: string): string {
  if (!markdown)
    return markdown

  return markdown
    .replace(/^#\s+/gm, '### ')
    .replace(/^##\s+/gm, '### ')
    .replace(/^\s*---\s*$/gm, '')
    .replace(/^\s*#{1,6}\s*预订链接\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
