<script setup lang="ts">
import hljs from 'highlight.js'
import * as smd from 'streaming-markdown'
import {
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

interface Props {
  /** Markdown 内容 */
  content: string
  /** 是否还在流式生成中 */
  isStreaming?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isStreaming: false,
})

const containerRef = ref<HTMLElement | null>(null)
let parser: smd.Parser | null = null
let lastContent = ''

/** 初始化 parser */
function initParser() {
  if (!containerRef.value || parser)
    return
  const renderer = smd.default_renderer(containerRef.value)
  parser = smd.parser(renderer)
}

/** 重置 parser 和容器 */
function resetParser() {
  if (containerRef.value) {
    containerRef.value.innerHTML = ''
  }
  parser = null
  lastContent = ''
}

/** 高亮容器内的代码块 */
function highlightCodeBlocks() {
  if (!containerRef.value)
    return
  const blocks = containerRef.value.querySelectorAll('pre code[class*="language-"]')
  blocks.forEach((block) => {
    const element = block as HTMLElement
    if (element.dataset.highlighted === 'true')
      return
    const langClass = Array.from(element.classList).find(c => c.startsWith('language-'))
    const language = langClass ? langClass.replace('language-', '') : 'plaintext'
    const safeLang = hljs.getLanguage(language) ? language : 'plaintext'
    element.innerHTML = hljs.highlight(element.textContent || '', { language: safeLang }).value
    element.dataset.highlighted = 'true'
  })
}

/** 结束流并刷新代码高亮 */
function endStream() {
  if (parser) {
    smd.parser_end(parser)
    parser = null
    highlightCodeBlocks()
  }
}

watch(() => props.content, (newContent) => {
  const content = newContent || ''

  // 内容被重置（长度变短或为空），清空重新渲染
  if (content.length < lastContent.length || !containerRef.value?.childNodes.length) {
    resetParser()
  }

  initParser()

  if (parser) {
    const added = content.slice(lastContent.length)
    if (added) {
      smd.parser_write(parser, added)
    }
  }

  lastContent = content
}, { flush: 'post' })

watch(() => props.isStreaming, (streaming) => {
  if (!streaming) {
    endStream()
  }
})

onMounted(() => {
  if (props.content) {
    initParser()
    if (parser) {
      smd.parser_write(parser, props.content)
      lastContent = props.content
    }
  }
})

onBeforeUnmount(() => {
  endStream()
})
</script>

<template>
  <div ref="containerRef" class="stream-message-content leading-7" />
</template>

<style scoped>
/* streaming-markdown 输出的是原生标签，需要手动给样式 */

.stream-message-content :deep(p) {
  margin-bottom: 0.75rem;
}

.stream-message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.stream-message-content :deep(ul),
.stream-message-content :deep(ol) {
  margin-bottom: 0.75rem;
  padding-left: 1.25rem;
}

.stream-message-content :deep(ul) {
  list-style-type: disc;
}

.stream-message-content :deep(ol) {
  list-style-type: decimal;
}

.stream-message-content :deep(li) {
  margin-bottom: 0.25rem;
}

.stream-message-content :deep(h1),
.stream-message-content :deep(h2),
.stream-message-content :deep(h3),
.stream-message-content :deep(h4),
.stream-message-content :deep(h5),
.stream-message-content :deep(h6) {
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.stream-message-content :deep(h1) {
  font-size: 1.25rem;
}

.stream-message-content :deep(h2) {
  font-size: 1.125rem;
}

.stream-message-content :deep(h3) {
  font-size: 1rem;
}

.stream-message-content :deep(blockquote) {
  border-left: 2px solid hsl(var(--border));
  padding-left: 0.75rem;
  font-style: italic;
  color: hsl(var(--muted-foreground));
  margin-bottom: 0.75rem;
}

.stream-message-content :deep(a) {
  color: hsl(var(--primary));
  text-decoration: underline;
}

.stream-message-content :deep(hr) {
  margin: 1rem 0;
  border-color: hsl(var(--border));
}

.stream-message-content :deep(table) {
  width: 100%;
  margin-bottom: 0.75rem;
  border-collapse: collapse;
}

.stream-message-content :deep(th),
.stream-message-content :deep(td) {
  border: 1px solid hsl(var(--border));
  padding: 0.5rem;
  text-align: left;
}

.stream-message-content :deep(th) {
  background-color: hsl(var(--muted));
  font-weight: 600;
}

.stream-message-content :deep(pre) {
  white-space: pre-wrap;
  word-break: normal;
  word-spacing: normal;
  background-color: #000;
  color: hsl(var(--foreground));
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--border));
  overflow-x: auto;
  margin-bottom: 0.75rem;
}

.stream-message-content :deep(code:not(.hljs)) {
  background-color: hsl(var(--muted));
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.stream-message-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

.stream-message-content :deep(img) {
  max-width: 100%;
  max-height: 400px;
  min-height: 200px;
  height: auto;
  border-radius: 0.5rem;
  display: block;
  background-color: hsl(var(--muted));
  object-fit: contain;
}
</style>
