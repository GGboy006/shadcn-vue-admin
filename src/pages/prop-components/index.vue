<script lang="ts" setup>
import { ArrowUpRightIcon, BadgeCheckIcon, ChevronRightIcon } from '@lucide/vue'

import { BasicPage } from '@/components/global-layout'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'

const components = [
  {
    title: '复制',
    description: '复制按钮组件，支持自定义样式和提示文本。',
    link: 'https://kit.prop.show/en/components/copy',
  },
  {
    title: '全屏对话框',
    description: '',
    link: 'https://kit.prop.show/en/components/full-screen-dialog',
  },
  {
    title: '行内提示',
    description: '行内提示组件，用于显示不同类型的提示信息。',
    link: 'https://kit.prop.show/en/components/inline-tip',
  },
  {
    title: '状态徽章',
    description: '',
    link: 'https://kit.prop.show/en/components/status-badge',
  },
]
</script>

<template>
  <BasicPage
    title="Prop 组件"
    description="shadcn-vue 的扩展组件集合。"
    sticky
  >
    <div class="grid grid-cols-1 md:grid-cols-2 w-full gap-6">
      <Item v-for="component in components" :key="component.title" variant="outline">
        <ItemContent>
          <ItemTitle>{{ component.title }}</ItemTitle>
          <ItemDescription>
            {{ component.description }}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm" as-child>
            <a
              :href="component.link"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2"
            >
              文档
              <ArrowUpRightIcon />
            </a>
          </Button>
        </ItemActions>
      </Item>

      <Item variant="outline" size="sm" as-child>
        <a href="https://kit.prop.show/en" target="_blank" rel="noopener noreferrer">
          <ItemMedia>
            <BadgeCheckIcon class="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>更多组件来自 kit.prop.show</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon class="size-4" />
          </ItemActions>
        </a>
      </Item>
    </div>
  </BasicPage>
</template>
