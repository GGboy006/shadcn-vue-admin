<script lang='ts' setup>
import { FolderOpenIcon } from '@lucide/vue'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
</script>

<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <FolderOpenIcon />
      </EmptyMedia>
      <EmptyTitle>暂无数据</EmptyTitle>
      <EmptyDescription>
        试试其他关键词,或检查拼写是否正确。
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>
