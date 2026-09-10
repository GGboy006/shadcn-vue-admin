<script lang="ts" setup>
import { CheckIcon, ChevronsUpDownIcon, XIcon } from '@lucide/vue'

import type { ICommunityCateTreeNode } from '@/services/api/community-cate.api'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useGetCateServiceTreeQuery } from '@/services/api/community-cate.api'
import { findCatePath, formatCatePathLabel } from '@/utils/community-cate-tree'

const props = withDefaults(defineProps<{
  modelValue?: string
  displayName?: string
  placeholder?: string
  triggerClass?: string
}>(), {
  placeholder: '请选择所属分类',
})

const emit = defineEmits<{
  select: [payload: { cateCode: string, cateName: string }]
}>()

const open = ref(false)
const activeParentCode = ref('')

const { data, isLoading, isError } = useGetCateServiceTreeQuery()
const tree = computed(() => data.value?.data ?? [])
const selectedPath = computed(() => findCatePath(tree.value, props.modelValue))

watch(
  [open, selectedPath, tree],
  () => {
    if (!open.value)
      return
    const parentCode = selectedPath.value[0]?.uniqueCode
    if (parentCode) {
      activeParentCode.value = parentCode
      return
    }
    if (!activeParentCode.value && tree.value[0])
      activeParentCode.value = tree.value[0].uniqueCode
  },
  { immediate: true },
)

const activeParent = computed(() =>
  tree.value.find(node => node.uniqueCode === activeParentCode.value),
)
const children = computed(() => activeParent.value?.children ?? [])

const displayLabel = computed(() => {
  const pathLabel = formatCatePathLabel(selectedPath.value)
  if (pathLabel)
    return pathLabel
  return props.displayName || ''
})

function selectLeaf(leaf: ICommunityCateTreeNode) {
  emit('select', { cateCode: leaf.uniqueCode, cateName: leaf.name })
  open.value = false
}

function clearSelection(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  emit('select', { cateCode: '', cateName: '' })
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        :data-empty="!displayLabel"
        :class="cn('w-full justify-between font-normal data-[empty=true]:text-muted-foreground', triggerClass)"
      >
        <span class="truncate">{{ displayLabel || placeholder }}</span>
        <span class="ml-2 flex shrink-0 items-center gap-1">
          <span
            v-if="displayLabel"
            role="button"
            class="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="清除分类"
            @click="clearSelection"
          >
            <XIcon class="size-3.5" />
          </span>
          <ChevronsUpDownIcon class="size-4 opacity-50" />
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="z-[60] w-[min(100vw-2rem,22rem)] p-0" align="start">
      <div v-if="isLoading" class="px-3 py-6 text-center text-sm text-muted-foreground">
        分类加载中...
      </div>
      <div v-else-if="isError" class="px-3 py-6 text-center text-sm text-destructive">
        分类树加载失败
      </div>
      <div v-else-if="!tree.length" class="px-3 py-6 text-center text-sm text-muted-foreground">
        暂无分类
      </div>
      <div v-else class="flex max-h-64">
        <div class="w-36 shrink-0 overflow-y-auto border-r">
          <button
            v-for="parent in tree"
            :key="parent.uniqueCode"
            type="button"
            :class="cn(
              'flex w-full items-center justify-between px-2.5 py-2 text-left text-sm hover:bg-accent',
              activeParentCode === parent.uniqueCode && 'bg-accent',
            )"
            @mouseenter="activeParentCode = parent.uniqueCode"
            @click="activeParentCode = parent.uniqueCode"
          >
            <span class="truncate">{{ parent.name }}</span>
          </button>
        </div>
        <div class="min-w-0 flex-1 overflow-y-auto">
          <div
            v-if="!children.length"
            class="px-3 py-6 text-center text-sm text-muted-foreground"
          >
            暂无二级分类
          </div>
          <button
            v-for="child in children"
            :key="child.uniqueCode"
            type="button"
            :class="cn(
              'flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left text-sm hover:bg-accent',
              modelValue === child.uniqueCode && 'bg-accent',
            )"
            @click="selectLeaf(child)"
          >
            <span class="truncate">{{ child.name }}</span>
            <CheckIcon
              v-if="modelValue === child.uniqueCode"
              class="size-4 shrink-0"
            />
          </button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
