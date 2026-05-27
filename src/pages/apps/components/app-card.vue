<script setup lang="ts">
import { SparklesIcon } from '@lucide/vue'

import type { ISkill } from '@/services/api/skill.api'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { inputTypeConfig } from '@/services/api/skill.api'

defineProps<{
  app: ISkill
}>()
</script>

<template>
  <Card class="group gap-1 sm:gap-2 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 pt-0 pb-2">
    <!-- 封面图区域 -->
    <div class="relative aspect-[2/1] sm:aspect-[16/10] overflow-hidden bg-muted">
      <img
        v-if="app.icon"
        :src="app.icon"
        :alt="app.name"
        class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
      >
      <div v-else class="flex items-center justify-center w-full h-full">
        <span class="text-3xl font-bold text-muted-foreground">
          {{ app.name?.slice(0, 1) }}
        </span>
      </div>

      <!-- 右上角状态标签 -->
      <Badge variant="success" class="absolute text-xs top-2 right-2">
        运行中
      </Badge>

      <!-- 左下角分类标签 -->
      <Badge
        :variant="inputTypeConfig[app.inputType]?.variant || 'default'"
        class="absolute text-xs bottom-2 left-2"
      >
        {{ inputTypeConfig[app.inputType]?.label || '未知' }}
      </Badge>
    </div>

    <CardContent class="p-1 sm:p-3">
      <h3 class="text-sm font-semibold line-clamp-1">
        {{ app.name }}
      </h3>
      <p class="mt-1 text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2">
        {{ app.description }}
      </p>

      <!-- 底部详细信息 -->
      <div class="flex items-start gap-1.5 mt-2.5 text-xs rounded-md bg-gray-100  p-2  text-muted-foreground">
        <SparklesIcon class="mt-0.5 size-3.5 shrink-0 text-primary" />
        <span class="line-clamp-1 sm:line-clamp-2">
          输入活动主题和文案，AI自动生成多种风格的海报供选择
        </span>
      </div>
    </CardContent>
  </Card>
</template>
