<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- content 来自后端富文本编辑器录入 -->
  <div class="rich-text-render text-sm leading-relaxed" v-html="content" />
</template>

<style>
/* 富文本内容渲染样式(非 scoped:v-html 注入的 DOM 不带 scoped 属性) */
.rich-text-render p {
  margin: 0.5rem 0;
  line-height: 1.7;
}

.rich-text-render h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
}

.rich-text-render h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
}

.rich-text-render h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem;
}

.rich-text-render ul,
.rich-text-render ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.rich-text-render ul {
  list-style: disc;
}

.rich-text-render ol {
  list-style: decimal;
}

.rich-text-render ul[data-type='taskList'] {
  list-style: none;
  padding: 0;
}

.rich-text-render ul[data-type='taskList'] li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.rich-text-render img {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
  margin: 0.5rem 0;
}

.rich-text-render a {
  color: hsl(var(--primary));
  text-decoration: underline;
}

.rich-text-render blockquote {
  border-left: 3px solid hsl(var(--border));
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: hsl(var(--muted-foreground));
}
</style>
