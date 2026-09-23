import type { IResponse } from '@/services/types/response.type'

import { useApiFetch } from '@/composables/use-fetch'
import { readChatFileId } from '@/utils/chat-upload-file'

export interface IChatUploadFileDetail {
  id?: string
  chatFileId?: string | number
  bytes?: number
  fileName?: string
  fileUrl?: string
  status?: string
}

export interface IUploadedChatFile {
  chatFileId: string
  fileName: string
  fileUrl: string
  bytes: number
  mime: string
}

export function useChatUploadFile() {
  const { apiFetch } = useApiFetch()

  async function uploadChatFile(file: File, fileType: number): Promise<IUploadedChatFile> {
    const form = new FormData()
    form.append('file', file)
    form.append('fileType', String(fileType))
    const res = await apiFetch<IResponse<IChatUploadFileDetail>>('/aiChat/chatUploadFile', {
      method: 'POST',
      body: form,
    })
    const chatFileId = readChatFileId(res.data?.chatFileId)
    if (!chatFileId)
      throw new Error('上传结果缺少文件 ID')
    return {
      chatFileId,
      fileName: res.data?.fileName || file.name,
      fileUrl: res.data?.fileUrl || '',
      bytes: res.data?.bytes ?? file.size,
      mime: file.type,
    }
  }

  return { uploadChatFile }
}
