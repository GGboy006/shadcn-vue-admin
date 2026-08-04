<script lang="ts" setup>
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HighlighterIcon,
  ImagePlusIcon,
  ItalicIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  PaletteIcon,
  Redo2Icon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
} from '@lucide/vue'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { useUpload } from '@/composables/use-upload'

/** 工具栏是否可编辑(只读时隐藏交互但保留展示) */
const props = withDefaults(defineProps<{
  /** 占位符 */
  placeholder?: string
  /** 最小高度,默认 240px */
  minHeight?: number
  /** 只读 */
  disabled?: boolean
}>(), {
  placeholder: '请输入内容...',
  minHeight: 240,
  disabled: false,
})

const modelValue = defineModel<string>()

const editor = useEditor({
  content: modelValue.value || '',
  editable: !props.disabled,
  extensions: [
    StarterKit,
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
    }),
    Image.configure({ inline: false, allowBase64: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Color,
    Highlight,
  ],
  onUpdate: ({ editor: e }) => {
    // 同步给 v-model(仅在有变化时,避免循环)
    const html = e.getHTML()
    if (html !== modelValue.value)
      modelValue.value = html
  },
})

// 外部 v-model 变化时回填(如编辑场景拉详情后)
watch(modelValue, (val) => {
  if (!editor.value)
    return
  if (editor.value.getHTML() === val)
    return
  editor.value.commands.setContent(val || '', { emitUpdate: false })
})

watch(() => props.disabled, (val) => {
  editor.value?.setEditable(!val)
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

// ==================== 工具栏交互 ====================

const { upload } = useUpload()

async function handleImageUpload() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file)
      return
    try {
      const url = await upload(file)
      editor.value?.chain().focus().setImage({ src: url }).run()
    }
    catch {
      // error handled by useUpload
    }
  }
  input.click()
}

// 链接
const linkPopoverOpen = ref(false)
const linkUrl = ref('')

function openLinkPopover() {
  const prev = editor.value?.getAttributes('link').href
  linkUrl.value = prev || ''
  linkPopoverOpen.value = true
}

function applyLink() {
  const url = linkUrl.value.trim()
  if (!url) {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  }
  else {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
  linkPopoverOpen.value = false
}

// 颜色 / 背景色
const colorPopoverOpen = ref(false)
const highlightPopoverOpen = ref(false)

/** 预设色板(覆盖常见需求) */
const COLORS = [
  '#000000',
  '#434343',
  '#666666',
  '#999999',
  '#b7b7b7',
  '#cccccc',
  '#d9d9d9',
  '#efefef',
  '#f3f3f3',
  '#ffffff',
  '#980000',
  '#ff0000',
  '#ff9900',
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#4a86e8',
  '#0000ff',
  '#9900ff',
  '#ff00ff',
  '#e6b8af',
  '#f4cccc',
  '#fce5cd',
  '#fff2cc',
  '#d9ead3',
  '#d0e0e3',
  '#c9daf8',
  '#cfe2f3',
  '#d9d2e9',
  '#ead1dc',
]

function setColor(color: string) {
  editor.value?.chain().focus().setColor(color).run()
  colorPopoverOpen.value = false
}

function unsetColor() {
  editor.value?.chain().focus().unsetColor().run()
  colorPopoverOpen.value = false
}

function setHighlight(color: string) {
  editor.value?.chain().focus().toggleHighlight({ color }).run()
  highlightPopoverOpen.value = false
}

function unsetHighlight() {
  editor.value?.chain().focus().unsetHighlight().run()
  highlightPopoverOpen.value = false
}

/** 工具栏按钮是否激活(用于 Toggle pressed 态) */
function isActive(name: string, attrs?: Record<string, unknown>): boolean {
  if (!editor.value)
    return false
  return editor.value.isActive(name, attrs)
}

/** 当前对齐方式是否为指定值 */
function isAlign(align: string): boolean {
  if (!editor.value)
    return false
  // 当前光标所在段落的 textAlign 属性
  const node = editor.value.isActive('heading') ? 'heading' : 'paragraph'
  return editor.value.getAttributes(node).textAlign === align
}
</script>

<template>
  <div v-if="editor" class="rounded-md border" :class="{ 'opacity-60': disabled }">
    <!-- 工具栏 -->
    <div v-if="!disabled" class="flex flex-wrap items-center gap-0.5 border-b p-1">
      <!-- 撤销/重做 -->
      <Toggle
        variant="default"
        size="sm"
        :pressed="false"
        :disabled="!editor.can().undo()"
        aria-label="撤销"
        @click="editor.chain().focus().undo().run()"
      >
        <Undo2Icon class="size-4" />
      </Toggle>
      <Toggle
        variant="default"
        size="sm"
        :pressed="false"
        :disabled="!editor.can().redo()"
        aria-label="重做"
        @click="editor.chain().focus().redo().run()"
      >
        <Redo2Icon class="size-4" />
      </Toggle>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <!-- 标题 -->
      <Toggle
        variant="default"
        size="sm"
        :pressed="isActive('heading', { level: 1 })"
        aria-label="标题1"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        <Heading1Icon class="size-4" />
      </Toggle>
      <Toggle
        variant="default"
        size="sm"
        :pressed="isActive('heading', { level: 2 })"
        aria-label="标题2"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <Heading2Icon class="size-4" />
      </Toggle>
      <Toggle
        variant="default"
        size="sm"
        :pressed="isActive('heading', { level: 3 })"
        aria-label="标题3"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        <Heading3Icon class="size-4" />
      </Toggle>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <!-- 加粗/斜体/下划线/删除线 -->
      <Toggle
        variant="default"
        size="sm"
        :pressed="isActive('bold')"
        aria-label="加粗"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <BoldIcon class="size-4" />
      </Toggle>
      <Toggle
        variant="default"
        size="sm"
        :pressed="isActive('italic')"
        aria-label="斜体"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <ItalicIcon class="size-4" />
      </Toggle>
      <Toggle
        variant="default"
        size="sm"
        :pressed="isActive('underline')"
        aria-label="下划线"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <UnderlineIcon class="size-4" />
      </Toggle>
      <Toggle
        variant="default"
        size="sm"
        :pressed="isActive('strike')"
        aria-label="删除线"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <StrikethroughIcon class="size-4" />
      </Toggle>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <!-- 列表 -->
      <Toggle
        variant="default"
        size="sm"
        :pressed="isActive('bulletList')"
        aria-label="无序列表"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <ListIcon class="size-4" />
      </Toggle>
      <Toggle
        variant="default"
        size="sm"
        :pressed="isActive('orderedList')"
        aria-label="有序列表"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <ListOrderedIcon class="size-4" />
      </Toggle>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <!-- 对齐 -->
      <Toggle
        variant="default"
        size="sm"
        :pressed="isAlign('left')"
        aria-label="左对齐"
        @click="editor.chain().focus().setTextAlign('left').run()"
      >
        <AlignLeftIcon class="size-4" />
      </Toggle>
      <Toggle
        variant="default"
        size="sm"
        :pressed="isAlign('center')"
        aria-label="居中"
        @click="editor.chain().focus().setTextAlign('center').run()"
      >
        <AlignCenterIcon class="size-4" />
      </Toggle>
      <Toggle
        variant="default"
        size="sm"
        :pressed="isAlign('right')"
        aria-label="右对齐"
        @click="editor.chain().focus().setTextAlign('right').run()"
      >
        <AlignRightIcon class="size-4" />
      </Toggle>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <!-- 颜色 -->
      <Popover v-model:open="colorPopoverOpen">
        <PopoverTrigger as-child>
          <Button variant="ghost" size="sm" class="h-8 gap-1 px-2" aria-label="字体颜色">
            <PaletteIcon class="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-64 p-2" align="start">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-xs text-muted-foreground">字体颜色</span>
            <Button variant="ghost" size="sm" class="h-6 px-2 text-xs" @click="unsetColor">
              清除
            </Button>
          </div>
          <div class="grid grid-cols-10 gap-1">
            <button
              v-for="color in COLORS"
              :key="color"
              type="button"
              class="size-5 rounded border border-border hover:scale-110 transition-transform"
              :style="{ backgroundColor: color }"
              :title="color"
              @click="setColor(color)"
            />
          </div>
        </PopoverContent>
      </Popover>

      <!-- 背景色 -->
      <Popover v-model:open="highlightPopoverOpen">
        <PopoverTrigger as-child>
          <Button variant="ghost" size="sm" class="h-8 gap-1 px-2" aria-label="背景色">
            <HighlighterIcon class="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-64 p-2" align="start">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-xs text-muted-foreground">背景色</span>
            <Button variant="ghost" size="sm" class="h-6 px-2 text-xs" @click="unsetHighlight">
              清除
            </Button>
          </div>
          <div class="grid grid-cols-10 gap-1">
            <button
              v-for="color in COLORS"
              :key="color"
              type="button"
              class="size-5 rounded border border-border hover:scale-110 transition-transform"
              :style="{ backgroundColor: color }"
              :title="color"
              @click="setHighlight(color)"
            />
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <!-- 链接 -->
      <Popover v-model:open="linkPopoverOpen">
        <PopoverTrigger as-child>
          <Toggle
            variant="default"
            size="sm"
            :pressed="isActive('link')"
            aria-label="链接"
            @click="openLinkPopover"
          >
            <Link2Icon class="size-4" />
          </Toggle>
        </PopoverTrigger>
        <PopoverContent class="w-80 p-2" align="start">
          <div class="flex flex-col gap-2">
            <span class="text-xs text-muted-foreground">链接地址</span>
            <Input v-model="linkUrl" type="url" placeholder="https://" @keyup.enter="applyLink" />
            <div class="flex justify-end gap-2">
              <Button variant="outline" size="sm" @click="linkUrl = ''; applyLink()">
                移除
              </Button>
              <Button size="sm" @click="applyLink">
                应用
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <!-- 图片 -->
      <Toggle
        variant="default"
        size="sm"
        :pressed="false"
        aria-label="插入图片"
        @click="handleImageUpload"
      >
        <ImagePlusIcon class="size-4" />
      </Toggle>
    </div>

    <!-- 编辑区 -->
    <EditorContent :editor="editor" class="rich-text-content" :style="{ minHeight: `${minHeight}px` }" />
  </div>
</template>

<style>
/* ProseMirror 编辑区基础样式;非 scoped 以覆盖 .ProseMirror 内部 */
.rich-text-content .ProseMirror {
  min-height: v-bind('`${minHeight}px`');
  padding: 0.75rem 1rem;
  outline: none;
}

.rich-text-content .ProseMirror:focus {
  outline: none;
}

.rich-text-content .ProseMirror p {
  margin: 0.5rem 0;
  line-height: 1.7;
}

.rich-text-content .ProseMirror h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
}

.rich-text-content .ProseMirror h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
}

.rich-text-content .ProseMirror h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem;
}

.rich-text-content .ProseMirror ul,
.rich-text-content .ProseMirror ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.rich-text-content .ProseMirror ul {
  list-style: disc;
}

.rich-text-content .ProseMirror ol {
  list-style: decimal;
}

.rich-text-content .ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
  margin: 0.5rem 0;
}

.rich-text-content .ProseMirror a {
  color: hsl(var(--primary));
  text-decoration: underline;
}

.rich-text-content .ProseMirror .ProseMirror-placeholder {
  color: hsl(var(--muted-foreground));
}

.rich-text-content .ProseMirror blockquote {
  border-left: 3px solid hsl(var(--border));
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: hsl(var(--muted-foreground));
}
</style>
