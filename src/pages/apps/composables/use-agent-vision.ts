import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { AgentVision } from '@/services/api/skill.api'

import {
  downloadPPT,
  downloadWord,
  useAgentVisionStream,
  useConvertPPTMutation,
  useGetPPTResultQuery,
} from '@/services/api/vision.api'

export type PPTState = 'idle' | 'streaming' | 'converting' | 'polling' | 'ready' | 'error'

interface UseAgentVisionOptions {
  vision: AgentVision
  chatId: string
  contentId?: string
  content: string
}

/**
 * 单个 AgentVision 的生成、轮询、下载状态管理
 */
export function useAgentVision(options: UseAgentVisionOptions) {
  const { vision, chatId, contentId, content } = options

  const visionContent = ref('')
  const isLoading = ref(true)
  const isDone = ref(false)
  const error = ref<string | null>(null)

  // PPT 专用状态
  const pptState = ref<PPTState>('idle')
  const pptTaskId = ref<string | null>(null)

  const { start } = useAgentVisionStream()
  const convertPPTMutation = useConvertPPTMutation()
  const { data: pptResultData } = useGetPPTResultQuery(pptTaskId)

  let abortStream: (() => void) | undefined

  /**
   * 启动 vision 生成
   */
  function startGeneration() {
    if (!chatId)
      return

    // 重置状态
    visionContent.value = ''
    isLoading.value = true
    isDone.value = false
    error.value = null
    pptState.value = vision.visionType === 2 ? 'streaming' : 'idle'
    pptTaskId.value = null

    const request = {
      agentId: vision.visionAgentId,
      agentVisionId: vision.id,
      chatId,
      contentId,
      aiChatMessages: [
        {
          role: 'user',
          content,
          contentId,
        },
      ],
    }

    const { abort } = start(request, {
      onMessage(newContent) {
        visionContent.value = newContent
      },
      onDone() {
        isLoading.value = false
        isDone.value = true

        if (vision.visionType === 2) {
          handlePPTConvert()
        }
        else {
          pptState.value = 'idle'
        }
      },
      onError(err) {
        isLoading.value = false
        error.value = err?.message || '生成失败'
        if (vision.visionType === 2) {
          pptState.value = 'error'
        }
      },
    })

    abortStream = abort
  }

  /**
   * PPT 转换
   */
  async function handlePPTConvert() {
    if (vision.visionType !== 2)
      return

    pptState.value = 'converting'

    try {
      const result = await convertPPTMutation.mutateAsync({
        content: visionContent.value,
        contentId,
        agentVisionId: vision.id,
        agentId: vision.visionAgentId,
      })

      if (result.code === 0 && result.data?.taskId) {
        pptTaskId.value = String(result.data.taskId)
        pptState.value = 'polling'
      }
      else {
        throw new Error(result.message || 'PPT 转换失败')
      }
    }
    catch (err) {
      pptState.value = 'error'
      error.value = err instanceof Error ? err.message : 'PPT 转换失败'
    }
  }

  /**
   * 监听 PPT 轮询结果
   */
  watch(pptResultData, (result) => {
    if (!result?.data)
      return

    const status = result.data.status
    if (status === 2) {
      pptState.value = 'ready'
    }
    else if (status === 3) {
      pptState.value = 'error'
      error.value = 'PPT 生成失败'
    }
  })

  /**
   * 下载
   */
  async function handleDownloadPPT() {
    if (!pptTaskId.value)
      return
    await downloadPPT(pptTaskId.value)
  }

  async function handleDownloadWord() {
    if (!visionContent.value)
      return
    await downloadWord(visionContent.value)
  }

  /**
   * 重置
   */
  function reset() {
    abortStream?.()
    abortStream = undefined
    visionContent.value = ''
    isLoading.value = false
    isDone.value = false
    error.value = null
    pptState.value = 'idle'
    pptTaskId.value = null
  }

  /**
   * 监听 content 变化，重新生成
   */
  watch(() => content, (newContent, oldContent) => {
    if (newContent && newContent !== oldContent) {
      reset()
      startGeneration()
    }
  })

  onMounted(() => {
    if (content)
      startGeneration()
  })

  onBeforeUnmount(() => {
    abortStream?.()
  })

  return {
    visionContent,
    isLoading,
    isDone,
    error,
    pptState,
    pptTaskId,
    downloadPPT: handleDownloadPPT,
    downloadWord: handleDownloadWord,
    reset,
  }
}
