<script setup lang="ts">
import { MedalIcon, StarIcon } from '@lucide/vue'

import type { IDigitalEmployee } from '@/services/api/digital-employee.api'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { onlineStatusConfig } from '@/services/api/digital-employee.api'

const props = defineProps<{
  employee: IDigitalEmployee
  /** 搜索模式下展示所属部门 */
  showDepartment?: boolean
}>()

const router = useRouter()

/** 离线员工整体置灰且不可进入对话 */
const isOffline = computed(() => props.employee.onlineStatus === 0)

const statusConfig = computed(() => onlineStatusConfig[props.employee.onlineStatus] ?? onlineStatusConfig[0])

/** 任务次数千分位格式化 */
const taskCountText = computed(() => (props.employee.taskCount ?? 0).toLocaleString())

/** 进入对话：aiType 3 走 AgentScope 流式，1/2 走现有 LoongAI */
function handleClick() {
  router.push(`/digital-employees/chat?employeeId=${props.employee.employeeId}`)
}
</script>

<template>
  <Card
    :class="cn(
      'gap-0 py-4 transition-all duration-300',
      isOffline
        ? 'opacity-60 grayscale pointer-events-none'
        : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer',
    )"
    @click="handleClick"
  >
    <CardContent class="flex flex-col gap-3 px-4">
      <!-- 头像 + 姓名/职位 + 在线状态 -->
      <div class="flex items-start gap-3">
        <Avatar class="size-12 shrink-0">
          <AvatarImage :src="employee.logo || ''" :alt="employee.employeeName" />
          <AvatarFallback>{{ employee.employeeName?.slice(0, 1) || 'AI' }}</AvatarFallback>
        </Avatar>
        <div class="min-w-0 flex-1">
          <h3 class="text-base font-semibold line-clamp-1">
            {{ employee.employeeName }}
          </h3>
          <p class="mt-0.5 text-sm text-muted-foreground line-clamp-1">
            {{ employee.title }}
          </p>
        </div>
        <Badge :variant="statusConfig.variant" class="shrink-0">
          {{ statusConfig.label }}
        </Badge>
      </div>

      <!-- 搜索模式下显示所属部门 -->
      <Badge v-if="showDepartment && employee.departmentName" variant="outline" class="w-fit">
        {{ employee.departmentName }}
      </Badge>

      <!-- 描述 -->
      <p class="text-sm text-muted-foreground line-clamp-2 min-h-10">
        {{ employee.description }}
      </p>

      <!-- 评分 / 任务数 / 等级标签 -->
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <span class="flex items-center gap-1">
          <StarIcon class="size-4 fill-amber-400 text-amber-400" />
          <span class="font-medium text-foreground">{{ employee.scoring ?? '-' }}</span>
        </span>
        <span class="text-border">|</span>
        <span class="flex items-center gap-1">
          <MedalIcon class="size-4" />
          {{ taskCountText }} 任务
        </span>
        <template v-if="employee.levelLabel">
          <span class="text-border">|</span>
          <span class="line-clamp-1">{{ employee.levelLabel }}</span>
        </template>
      </div>

      <!-- 能力标签 -->
      <div v-if="employee.tags?.length" class="flex flex-wrap gap-1.5">
        <Badge
          v-for="tag in employee.tags"
          :key="tag"
          variant="info"
          class="rounded-md"
        >
          {{ tag }}
        </Badge>
      </div>
    </CardContent>
  </Card>
</template>
