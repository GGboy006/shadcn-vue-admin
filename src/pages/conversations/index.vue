<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon, MessageSquareIcon } from '@lucide/vue'
import { useDebounceFn } from '@vueuse/core'

import type { IConversationListQuery } from '@/services/api/conversation.api'

import { BasicPage } from '@/components/global-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { serviceModeConfig, useGetConversationListQuery, userTagConfig } from '@/services/api/conversation.api'

// 查询参数
const query = ref<IConversationListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data: conversationData, isLoading } = useGetConversationListQuery(query)

const list = computed(() => conversationData.value?.data?.list ?? [])
const total = computed(() => conversationData.value?.data?.total ?? 0)
const pages = computed(() => conversationData.value?.data?.pages ?? 0)

const status = ref<string>('all')
const searchTitle = ref('')

// 状态筛选
watch(status, (val) => {
  query.value.status = val === 'all' ? undefined : val
  query.value.pageNum = 1
})

// 搜索防抖
const debouncedSearch = useDebounceFn((_val: string) => {
  // 接口暂无标题搜索参数，前端过滤或后续扩展
  query.value.pageNum = 1
}, 300)

watch(searchTitle, val => debouncedSearch(val))

function goToPage(page: number) {
  if (page < 1 || page > pages.value)
    return
  query.value.pageNum = page
}

function handleReset() {
  status.value = 'all'
  searchTitle.value = ''
  query.value = {
    pageNum: 1,
    pageSize: 10,
  }
}

function formatDate(dateStr: string) {
  if (!dateStr)
    return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<template>
  <BasicPage
    title="会话列表"
    description="查看AI生成图片的历史会话记录"
    sticky
  >
    <!-- 筛选区 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <UiInput
          v-model:model-value="searchTitle"
          placeholder="搜索会话标题..."
          class="h-9 w-full sm:w-52"
        />
        <Select v-model="status">
          <SelectTrigger class="h-9 w-full sm:w-40">
            <SelectValue placeholder="全部状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              全部状态
            </SelectItem>
            <SelectItem value="1">
              待介入
            </SelectItem>
            <SelectItem value="2">
              已完成
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" size="sm" @click="handleReset">
        重置筛选
      </Button>
    </div>

    <!-- 数据表格 -->
    <div class="mt-4 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>会话标题</TableHead>
            <TableHead>用户标签</TableHead>
            <TableHead>服务模式</TableHead>
            <TableHead>最后消息</TableHead>
            <TableHead>最后消息时间</TableHead>
            <TableHead class="text-right">
              操作
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="isLoading">
            <TableRow v-for="i in 5" :key="i">
              <TableCell v-for="j in 6" :key="j">
                <Skeleton class="h-4 w-full" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="list.length > 0">
            <TableRow v-for="item in list" :key="item.chatId">
              <TableCell>
                <div class="flex items-center gap-2">
                  <MessageSquareIcon class="size-4 text-muted-foreground" />
                  <span class="font-medium">{{ item.title || '未命名会话' }}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {{ userTagConfig[item.userTag] || '未知' }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge :variant="serviceModeConfig[item.serviceMode]?.variant || 'default'">
                  {{ serviceModeConfig[item.serviceMode]?.label || '未知' }}
                </Badge>
              </TableCell>
              <TableCell>
                <p class="max-w-[200px] truncate text-sm text-muted-foreground">
                  {{ item.lastMessagePreview || '-' }}
                </p>
              </TableCell>
              <TableCell>
                <span class="text-sm text-muted-foreground">{{ formatDate(item.lastMessageTime) }}</span>
              </TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="sm" @click="$router.push(`/conversations/${item.chatId}`)">
                  查看详情
                </Button>
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell colspan="6" class="h-32 text-center text-muted-foreground">
                暂无会话数据
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- 分页 -->
    <div v-if="!isLoading && list.length > 0" class="flex items-center justify-between mt-6">
      <p class="text-sm text-muted-foreground">
        共 {{ total }} 条，第 {{ query.pageNum }} / {{ pages }} 页
      </p>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="query.pageNum <= 1"
          @click="goToPage(query.pageNum - 1)"
        >
          <ChevronLeftIcon class="size-4" />
          <span class="ml-1">上一页</span>
        </Button>
        <div class="flex items-center space-x-1">
          <Button
            v-for="page in pages"
            :key="page"
            variant="outline"
            size="sm"
            :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': page === query.pageNum }"
            @click="goToPage(page)"
          >
            {{ page }}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          :disabled="query.pageNum >= pages"
          @click="goToPage(query.pageNum + 1)"
        >
          <span class="mr-1">下一页</span>
          <ChevronRightIcon class="size-4" />
        </Button>
      </div>
    </div>
  </BasicPage>
</template>

<route lang="yaml">
meta:
  auth: true
</route>
