<script setup lang="ts">
import { SearchIcon } from '@lucide/vue'

import type { IDepartmentEmployee, IDigitalEmployee } from '@/services/api/digital-employee.api'

import { BasicPage } from '@/components/global-layout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useGetDepartmentEmployeeListQuery } from '@/services/api/digital-employee.api'

import EmployeeCard from './components/employee-card.vue'

// ==================== 数据加载 ====================

const { data: listData, isLoading } = useGetDepartmentEmployeeListQuery()

const departments = computed<IDepartmentEmployee[]>(() =>
  [...(listData.value?.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
)

/** 全部数字员工总数 */
const totalEmployees = computed(() =>
  departments.value.reduce((sum, dept) => sum + (dept.employeeCount ?? 0), 0),
)

const pageDescription = computed(() =>
  `一人公司 OPC 组织架构，共 ${totalEmployees.value} 位 AI 数字员工`,
)

// ==================== 部门选中 ====================

const selectedDepartmentId = ref<number | null>(null)

// 数据加载后默认选中第一个部门
watch(departments, (depts) => {
  if (depts.length > 0 && selectedDepartmentId.value === null) {
    selectedDepartmentId.value = depts[0].departmentId
  }
}, { immediate: true })

const selectedDepartment = computed(() =>
  departments.value.find(dept => dept.departmentId === selectedDepartmentId.value),
)

// ==================== 搜索（前端本地过滤，跨全部部门） ====================

const searchTerm = ref('')

const isSearching = computed(() => !!searchTerm.value.trim())

/** 按 姓名/职位/标签 匹配全部部门的员工 */
const searchResults = computed<IDigitalEmployee[]>(() => {
  const keyword = searchTerm.value.trim().toLowerCase()
  if (!keyword)
    return []
  return departments.value
    .flatMap(dept => dept.employeeList ?? [])
    .filter((emp) => {
      const name = emp.employeeName?.toLowerCase() ?? ''
      const title = emp.title?.toLowerCase() ?? ''
      const tags = emp.tags?.join(',').toLowerCase() ?? ''
      return name.includes(keyword) || title.includes(keyword) || tags.includes(keyword)
    })
})

/** 当前展示的员工列表：搜索时跨部门，否则取选中部门 */
const displayEmployees = computed<IDigitalEmployee[]>(() => {
  if (isSearching.value)
    return searchResults.value
  return selectedDepartment.value?.employeeList ?? []
})

// ==================== 组织架构汇总的部门圆点配色 ====================

const departmentDotColors = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-lime-500',
]

function getDepartmentDotColor(index: number) {
  return departmentDotColors[index % departmentDotColors.length]
}
</script>

<template>
  <BasicPage
    title="OPC 数字员工"
    :description="pageDescription"
    sticky
  >
    <template #actions>
      <div class="relative w-full sm:w-64">
        <SearchIcon class="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <UiInput
          v-model:model-value="searchTerm"
          placeholder="搜索数字员工..."
          class="h-9 pl-8"
        />
      </div>
    </template>

    <!-- 加载骨架 -->
    <template v-if="isLoading">
      <div class="flex gap-2">
        <Skeleton v-for="i in 5" :key="i" class="h-10 w-28 rounded-full" />
      </div>
      <Skeleton class="mt-4 h-20" />
      <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton v-for="i in 6" :key="i" class="h-52" />
      </div>
    </template>

    <template v-else>
      <!-- 部门 Tab（搜索时隐藏） -->
      <div v-if="!isSearching" class="flex flex-wrap gap-2">
        <Button
          v-for="dept in departments"
          :key="dept.departmentId"
          :variant="dept.departmentId === selectedDepartmentId ? 'default' : 'outline'"
          class="h-10 rounded-full px-4"
          @click="selectedDepartmentId = dept.departmentId"
        >
          <span
            :class="cn(
              'flex size-5 items-center justify-center rounded-full text-xs',
              dept.departmentId === selectedDepartmentId
                ? 'bg-primary-foreground/20'
                : 'bg-muted text-muted-foreground',
            )"
          >
            {{ dept.employeeCount }}
          </span>
          {{ dept.departmentName }}
        </Button>
      </div>

      <!-- 选中部门信息横幅（搜索时隐藏） -->
      <Card v-if="!isSearching && selectedDepartment" class="mt-4 border-primary/20 bg-primary/5 py-4">
        <CardContent class="flex items-center gap-3 px-4">
          <Avatar class="size-11 shrink-0">
            <AvatarImage :src="selectedDepartment.logo || ''" :alt="selectedDepartment.departmentName" />
            <AvatarFallback>{{ selectedDepartment.departmentName?.slice(0, 1) }}</AvatarFallback>
          </Avatar>
          <div class="min-w-0">
            <h2 class="font-semibold text-primary">
              {{ selectedDepartment.departmentName }}
            </h2>
            <p class="mt-0.5 text-sm text-muted-foreground line-clamp-1">
              {{ selectedDepartment.description }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- 搜索结果提示 -->
      <p v-if="isSearching" class="text-sm text-muted-foreground">
        共找到 {{ searchResults.length }} 位数字员工
      </p>

      <!-- 员工卡片网格 -->
      <main class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <template v-if="displayEmployees.length > 0">
          <EmployeeCard
            v-for="employee in displayEmployees"
            :key="employee.employeeId"
            :employee="employee"
            :show-department="isSearching"
          />
        </template>
        <template v-else>
          <div class="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p class="text-lg">
              {{ isSearching ? '未找到匹配的数字员工' : '该部门暂无数字员工' }}
            </p>
            <p class="mt-1 text-sm">
              {{ isSearching ? '请尝试其他关键词' : '请等待管理员分配' }}
            </p>
          </div>
        </template>
      </main>

      <!-- 组织架构汇总 -->
      <Card v-if="departments.length > 0" class="mt-6 py-4">
        <CardContent class="px-4">
          <h3 class="font-semibold">
            OPC 公司组织架构
          </h3>
          <div class="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span
              v-for="(dept, index) in departments"
              :key="dept.departmentId"
              class="flex items-center gap-2"
            >
              <span :class="cn('size-2.5 rounded-full', getDepartmentDotColor(index))" />
              <span>{{ dept.departmentName }}</span>
              <span class="font-medium text-primary">{{ dept.employeeCount }} 人</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </template>
  </BasicPage>
</template>

<route lang="yaml">
meta:
  auth: true
  roles: [3]
</route>
