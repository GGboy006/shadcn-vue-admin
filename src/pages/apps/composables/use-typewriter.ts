import { ref, watch } from 'vue'

/**
 * 打字机效果
 * @param text 要显示的完整文本
 * @param speed 打字速度（毫秒/字）
 * @returns 当前显示的文本和是否正在打字
 */
export function useTypewriter(text: Ref<string>, speed = 30) {
  const displayText = ref('')
  const isTyping = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null
  let currentIndex = 0

  function startTyping() {
    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    displayText.value = ''
    currentIndex = 0
    isTyping.value = true

    function typeNext() {
      if (currentIndex < text.value.length) {
        displayText.value += text.value[currentIndex]
        currentIndex++
        timer = setTimeout(typeNext, speed)
      }
      else {
        isTyping.value = false
        timer = null
      }
    }

    typeNext()
  }

  function stopTyping() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    isTyping.value = false
  }

  // 监听文本变化，自动开始打字
  watch(text, (newText) => {
    if (newText && newText.length > 0) {
      startTyping()
    }
  }, { immediate: true })

  return {
    displayText,
    isTyping,
    startTyping,
    stopTyping,
  }
}
