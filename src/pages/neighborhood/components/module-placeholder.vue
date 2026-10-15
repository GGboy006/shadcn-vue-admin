<script setup lang="ts">
import { ConstructionIcon } from '@lucide/vue'

import { BasicPage } from '@/components/global-layout'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

/**
 * 居委会「村务治理 / 居民服务」页面骨架占位。
 * 后端接口与产品方案未最终确认前,只提供统一的页面外壳,不含业务逻辑。
 */
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <BasicPage :title="title" :description="description" sticky>
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ConstructionIcon />
        </EmptyMedia>
        <EmptyTitle>功能对接中</EmptyTitle>
        <EmptyDescription>
          该模块正在与后端对接接口,上线后将在此处提供管理能力。
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  </BasicPage>
</template>
