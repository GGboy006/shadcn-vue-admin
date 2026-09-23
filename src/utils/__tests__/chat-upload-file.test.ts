import { describe, expect, it } from 'vitest'

import { chatStreamFileType, readChatFileId } from '../chat-upload-file'

describe('chatStreamFileType', () => {
  it('图片用 image，其余用 file', () => {
    expect(chatStreamFileType('image/png')).toBe('image')
    expect(chatStreamFileType('IMAGE/JPEG')).toBe('image')
    expect(chatStreamFileType('application/pdf')).toBe('file')
    expect(chatStreamFileType('')).toBe('file')
  })
})

describe('readChatFileId', () => {
  it('保留字符串 ID，数字转成字符串', () => {
    expect(readChatFileId('2096000000000002001')).toBe('2096000000000002001')
    expect(readChatFileId(12)).toBe('12')
    expect(readChatFileId(null)).toBe('')
  })
})
