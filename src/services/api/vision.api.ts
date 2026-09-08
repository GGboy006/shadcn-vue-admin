import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'

import { useApiFetch } from '@/composables/use-fetch'
import { createStreamUrl, useTextStream } from '@/composables/use-text-stream'
import { mergeStreamText } from '@/utils/stream-text'

import type { IResponse } from '../types/response.type'

/** AgentVision SSE 事件 */
export interface AgentVisionStreamEvent {
  event: string
  id?: string
  data: Record<string, any>
}

/** AgentVision 请求参数 */
export interface AgentVisionRequest {
  agentId: string
  agentVisionId: string
  chatId: string
  contentId?: string
  aiChatMessages: Array<{
    role: string
    content: string
    contentId?: string
  }>
}

/** PPT 转换响应 */
export interface IPPTConvertResponse {
  taskId: string
}

/** PPT 生成结果 */
export interface IPPTResult {
  status: 0 | 1 | 2 | 3
  ppt_title?: string
  download_url?: string
}

/** Word 下载响应 */
export interface IWordDownloadResponse {
  download_url: string
}

/**
 * 创建 AgentVision SSE 流
 * 返回 content 累积字符串和 abort 方法
 */
export function useAgentVisionStream() {
  const { createTextSSE } = useTextStream()

  function start(
    request: AgentVisionRequest,
    callbacks: {
      onMessage: (content: string) => void
      onDone: () => void
      onError: (error: any) => void
    },
  ) {
    let visionContent = ''

    const { abort } = createTextSSE({
      url: createStreamUrl('/aiChat/chat/stream/agentVisionCompletion'),
      body: JSON.stringify(request),
      onMessage(event) {
        if (event.event === '[DATA]' && event.data.content) {
          visionContent = mergeStreamText(visionContent, event.data.content, event.data.fullFlag)
          callbacks.onMessage(visionContent)
        }
      },
      onReasoning() {},
      onReasoningEnd() {},
      onDone(event) {
        if (event.event === '[DATA]' && event.data.content) {
          visionContent = mergeStreamText(visionContent, event.data.content, event.data.fullFlag)
          callbacks.onMessage(visionContent)
        }
        callbacks.onDone()
      },
      onError(err) {
        callbacks.onError(err)
      },
    })

    return { abort }
  }

  return { start }
}

/**
 * 转换 PPT
 */
export function useConvertPPTMutation() {
  const { apiFetch } = useApiFetch()

  return useMutation<IResponse<IPPTConvertResponse>, Error, {
    content: string
    contentId?: string
    agentVisionId: string
    agentId: string
  }>({
    mutationKey: ['convertPPT'],
    mutationFn: async params => await apiFetch<IResponse<IPPTConvertResponse>>('/aiChat/vision/convertPPT', {
      method: 'post',
      body: params,
    }),
  })
}

/**
 * 查询 PPT 生成结果
 */
export function useGetPPTResultQuery(taskId: Ref<string | null>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IPPTResult>, Error>({
    queryKey: ['pptResult', taskId],
    queryFn: async () => await apiFetch<IResponse<IPPTResult>>('/chatPPT/result', {
      method: 'get',
      query: { id: taskId.value },
    }),
    enabled: computed(() => !!taskId.value),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status
      // 等待中(0)或生成中(1)时轮询
      if (status === 0 || status === 1)
        return 20000
      return false
    },
    retry: false,
  })
}

/**
 * 下载 PPT
 * 先获取下载链接，再打开
 */
export async function downloadPPT(taskId: string) {
  const { apiFetch } = useApiFetch()
  const result = await apiFetch<IResponse<{ download_url: string }>>('/chatPPT/download', {
    method: 'get',
    query: { id: taskId, type: 'pptx' },
  })
  if (result.data?.download_url) {
    window.open(result.data.download_url, '_blank')
  }
}

/**
 * 下载 Word
 * 先获取下载链接，再打开
 */
export async function downloadWord(htmlContent: string) {
  const { apiFetch } = useApiFetch()
  const result = await apiFetch<IResponse<IWordDownloadResponse>>('/aiChat/vision/downloadWord', {
    method: 'get',
    query: { htmlContent },
  })
  if (result.data?.download_url) {
    window.open(result.data.download_url, '_blank')
  }
}
