/** 发消息时 files[].fileType：图片用 image，其余用 file */
export function chatStreamFileType(mime: string): 'image' | 'file' {
  return mime.toLowerCase().startsWith('image/') ? 'image' : 'file'
}

export function readChatFileId(value: unknown): string {
  if (typeof value === 'string')
    return value.trim()
  if (typeof value === 'number' && Number.isFinite(value))
    return String(value)
  return ''
}
