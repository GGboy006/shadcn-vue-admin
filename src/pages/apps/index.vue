<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'
import { useThrottleFn } from '@vueuse/core'

import type { TSort } from '@/components/sort-select/types'
import type { ISkillListQuery } from '@/services/api/skill.api'

import { BasicPage } from '@/components/global-layout'
import { SortSelect } from '@/components/sort-select'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { skillTypeOptions, useGetSkillListQuery } from '@/services/api/skill.api'

import AppCard from './components/app-card.vue'

// 查询参数
const query = ref<ISkillListQuery>({
  pageNum: 1,
  pageSize: 12,
})

const searchTerm = ref('')
const skillType = ref('all')
const sort = ref<TSort>('asc')

// 搜索防抖
const throttledSearch = useThrottleFn(() => {
  query.value = {
    ...query.value,
    pageNum: 1,
    name: searchTerm.value || undefined,
  }
}, 300)

watch(searchTerm, () => {
  throttledSearch()
})

// 类型筛选
watch(skillType, (newValue) => {
  query.value = {
    ...query.value,
    pageNum: 1,
    type: newValue === 'all' ? undefined : newValue as ISkillListQuery['type'],
  }
})

// 排序
watch(sort, (newValue) => {
  query.value = {
    ...query.value,
    pageNum: 1,
    sortItemList: newValue === 'asc' ? 'name' : '-name',
  }
})

// API 请求
const { data: skillListData, isLoading } = useGetSkillListQuery(query)

const skillList = computed(() => skillListData.value?.data?.list || [])
const total = computed(() => skillListData.value?.data?.total || 0)
const pageSize = computed(() => query.value.pageSize)
const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)
const currentPage = computed(() => query.value.pageNum)

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value)
    return
  query.value = { ...query.value, pageNum: page }
}
</script>

<template>
  <BasicPage
    title="AI工具管理"
    description="管理和使用您的AI技能工具"
    sticky
  >
    <!-- 筛选区 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <UiInput
          v-model:model-value="searchTerm"
          placeholder="搜索技能名称..."
          class="h-9 w-full sm:w-52"
        />
        <Select v-model="skillType">
          <SelectTrigger class="h-9 w-full sm:w-40">
            <SelectValue placeholder="全部类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="option in skillTypeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <SortSelect v-model:sort="sort" />
    </div>

    <!-- 卡片网格 -->
    <main class="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <template v-if="isLoading">
        <Skeleton v-for="i in 12" :key="i" class="h-64" />
      </template>
      <template v-else-if="skillList.length > 0">
        <AppCard
          v-for="app in skillList"
          :key="app.skillId"
          :app="app"
        />
      </template>
      <template v-else>
        <div class="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p class="text-lg">
            暂无数据
          </p>
          <p class="mt-1 text-sm">
            请尝试调整筛选条件
          </p>
        </div>
      </template>
    </main>

    <!-- 分页 -->
    <div v-if="!isLoading && skillList.length > 0" class="flex items-center justify-between mt-6">
      <p class="text-sm text-muted-foreground">
        共 {{ total }} 条，第 {{ currentPage }} / {{ totalPages }} 页
      </p>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeftIcon class="size-4" />
          <span class="ml-1">上一页</span>
        </Button>
        <div class="flex items-center space-x-1">
          <Button
            v-for="page in totalPages"
            :key="page"
            variant="outline"
            size="sm"
            :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
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
