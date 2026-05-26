import { toast } from 'vue-sonner'

import { useApiFetch } from './use-fetch'

export interface UploadOptions {
  /** 文件大小限制（MB），默认 10 */
  maxSize?: number
  /** 允许的文件类型，默认图片 */
  accept?: string[]
}

export function useUpload(options: UploadOptions = {}) {
  const { maxSize = 10, accept = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] } = options
  const loading = ref(false)
  const { apiFetch } = useApiFetch()

  async function upload(file: File): Promise<string> {
    // 文件类型校验
    if (accept.length > 0 && !accept.includes(file.type)) {
      toast.error(`不支持的文件类型：${file.type}`)
      throw new Error(`不支持的文件类型：${file.type}`)
    }

    // 文件大小校验
    const maxBytes = maxSize * 1024 * 1024
    if (file.size > maxBytes) {
      toast.error(`文件大小超过限制：${maxSize}MB`)
      throw new Error(`文件大小超过限制：${maxSize}MB`)
    }

    const formData = new FormData()
    formData.append('file', file)

    loading.value = true
    try {
      const res = await apiFetch('/ossFile/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.code === 0 && res.data) {
        return res.data as string
      }
      throw new Error(res.msg || '上传失败')
    }
    finally {
      loading.value = false
    }
  }

  return {
    upload,
    loading,
  }
}
