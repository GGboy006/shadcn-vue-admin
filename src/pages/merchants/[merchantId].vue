<script setup lang="ts">
import {
  ArrowLeftIcon,
  BarChart3Icon,
  CheckIcon,
  FileTextIcon,
  ImageIcon,
  LayersIcon,
  MicIcon,
  SaveIcon,
  SparklesIcon,
  XIcon,
} from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IAssignSkill } from '@/services/api/skill.api'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  businessStatusConfig,
  merchantTypeConfig,
  useGetMerchantDetailQuery,
} from '@/services/api/merchant.api'
import {
  skillInputTypeConfig,
  useAssignSkillToMerchantMutation,
  useGetMerchantSkillListQuery,
} from '@/services/api/skill.api'

const route = useRoute()
const router = useRouter()
const merchantId = computed(() => (route.params as Record<string, string>).merchantId)

// ==================== 商户详情 ====================
const { data: merchantData, isLoading: isMerchantLoading } = useGetMerchantDetailQuery(merchantId)
const merchant = computed(() => merchantData.value?.data)

// ==================== AI 工具列表 ====================
const skillQuery = ref({
  merchantId: merchantId.value,
  pageNum: 1,
  pageSize: 200,
})

watch(merchantId, (val) => {
  if (val) {
    skillQuery.value.merchantId = val
  }
}, { immediate: true })

const { data: skillData, isLoading: isSkillLoading } = useGetMerchantSkillListQuery(skillQuery)
const skillList = computed(() => skillData.value?.data?.list ?? [])

// ==================== 选中状态管理 ====================
const selectedSkillIds = ref<Set<number>>(new Set())

// 根据接口返回的 checked 初始化选中状态
watch(skillList, (list) => {
  if (list.length > 0) {
    const checkedIds = new Set<number>()
    for (const skill of list) {
      if (skill.checked) {
        checkedIds.add(skill.skillId)
      }
    }
    selectedSkillIds.value = checkedIds
  }
}, { immediate: true })

const selectedCount = computed(() => selectedSkillIds.value.size)

function toggleSkill(skill: IAssignSkill) {
  const newSet = new Set(selectedSkillIds.value)
  if (newSet.has(skill.skillId)) {
    newSet.delete(skill.skillId)
  }
  else {
    newSet.add(skill.skillId)
  }
  selectedSkillIds.value = newSet
}

function isSkillSelected(skill: IAssignSkill): boolean {
  return selectedSkillIds.value.has(skill.skillId)
}

// ==================== 保存分配 ====================
const { mutate: assignSkills, isPending: isSaving } = useAssignSkillToMerchantMutation()

function handleSave() {
  if (!merchant.value)
    return
  assignSkills({
    merchantId: merchantId.value,
    skillIds: Array.from(selectedSkillIds.value),
  }, {
    onSuccess: () => {
      toast.success('保存成功')
    },
    onError: (error) => {
      toast.error(error.message || '保存失败')
    },
  })
}

// ==================== 图标映射 ====================
const inputTypeIconMap: Record<number, any> = {
  1: FileTextIcon,
  2: ImageIcon,
  3: MicIcon,
  4: BarChart3Icon,
}

function getSkillIcon(skill: IAssignSkill) {
  return inputTypeIconMap[skill.inputType] || LayersIcon
}

function getSkillIconBg(skill: IAssignSkill): string {
  const map: Record<number, string> = {
    1: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    2: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
    3: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
    4: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  }
  return map[skill.inputType] || 'bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
}

// ==================== 格式化 ====================
function formatDate(dateStr: string | undefined): string {
  if (!dateStr)
    return '-'
  return dateStr.split('T')[0]
}
</script>

<template>
  <div class="px-6 pt-4 pb-6">
    <!-- 返回按钮 -->
    <Button variant="ghost" size="sm" class="mb-3" @click="router.back()">
      <ArrowLeftIcon class="size-4 mr-1" />
      返回
    </Button>

    <!-- 商户信息卡片 -->
    <Card class="mb-4">
      <CardContent class="p-4">
        <!-- 加载状态 -->
        <template v-if="isMerchantLoading">
          <div class="flex items-start gap-4">
            <Skeleton class="size-16 rounded-xl" />
            <div class="flex-1 space-y-3">
              <Skeleton class="h-6 w-48" />
              <div class="flex gap-6 pt-2">
                <Skeleton class="h-4 w-24" />
                <Skeleton class="h-4 w-32" />
                <Skeleton class="h-4 w-40" />
                <Skeleton class="h-4 w-28" />
              </div>
            </div>
          </div>
        </template>

        <!-- 数据展示 -->
        <template v-else-if="merchant">
          <div class="flex items-start gap-4">
            <!-- Logo / 头像 -->
            <Avatar class="size-16 rounded-xl">
              <AvatarImage v-if="merchant.logo" :src="merchant.logo" :alt="merchant.merchantName" />
              <AvatarFallback class="text-lg bg-primary/10 text-primary">
                {{ merchant.merchantName?.charAt(0) || '商' }}
              </AvatarFallback>
            </Avatar>

            <!-- 信息区域 -->
            <div class="flex-1 min-w-0">
              <!-- 名称行 -->
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-xl font-semibold">
                  {{ merchant.merchantName }}
                </h1>
                <Badge :variant="merchantTypeConfig[merchant.type]?.variant || 'default'">
                  {{ merchantTypeConfig[merchant.type]?.label || '未知' }}
                </Badge>
                <Badge :variant="businessStatusConfig[merchant.businessStatus]?.variant || 'default'">
                  {{ businessStatusConfig[merchant.businessStatus]?.label || '未知' }}
                </Badge>
              </div>

              <!-- 信息网格 -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 mt-3 text-sm">
                <div>
                  <span class="text-muted-foreground">联系人</span>
                  <p class="font-medium mt-0.5">
                    {{ merchant.contactName || '-' }}
                  </p>
                </div>
                <div>
                  <span class="text-muted-foreground">联系电话</span>
                  <p class="font-medium mt-0.5">
                    {{ merchant.contactPhone || '-' }}
                  </p>
                </div>
                <div>
                  <span class="text-muted-foreground">地址</span>
                  <p class="font-medium mt-0.5 truncate">
                    {{ merchant.address || '-' }}
                  </p>
                </div>
                <div>
                  <span class="text-muted-foreground">签约日期</span>
                  <p class="font-medium mt-0.5">
                    {{ formatDate(merchant.signDate) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </CardContent>
    </Card>

    <!-- AI 工具分配区域 -->
    <div>
      <!-- 标题栏 -->
      <div class="sticky top-0 z-10 flex items-center justify-between py-3 bg-background border-b">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <SparklesIcon class="size-5 text-primary" />
            <h2 class="text-lg font-semibold">
              AI 工具分配
            </h2>
          </div>
          <Badge variant="secondary">
            已选 {{ selectedCount }} 个
          </Badge>
        </div>
        <Button :disabled="isSaving" @click="handleSave">
          <SaveIcon class="size-4 mr-1.5" />
          {{ isSaving ? '保存中...' : '保存分配' }}
        </Button>
      </div>

      <!-- 说明文字 -->
      <p class="text-sm text-muted-foreground mt-3">
        勾选下方AI工具，为该商户分配可用的AI赋能服务。分配后，商户可在自己的后台直接使用这些工具。
      </p>

      <!-- 加载状态 -->
      <div v-if="isSkillLoading" class="space-y-3 mt-3">
        <Skeleton v-for="i in 4" :key="i" class="h-24 w-full rounded-xl" />
      </div>

      <!-- AI 工具列表 -->
      <div v-else-if="skillList.length > 0" class="space-y-3 mt-3">
        <Card
          v-for="skill in skillList"
          :key="skill.skillId"
          class="cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="[
            isSkillSelected(skill)
              ? 'ring-2 ring-primary border-primary bg-primary/5'
              : 'border-border hover:border-primary/50',
          ]"
          @click="toggleSkill(skill)"
        >
          <CardContent class="p-4">
            <div class="flex items-center gap-4">
              <!-- Checkbox -->
              <Checkbox
                :checked="isSkillSelected(skill)"
                class="pointer-events-none"
                @click.stop
              />

              <!-- 图标 -->
              <div
                class="size-10 rounded-lg flex items-center justify-center shrink-0"
                :class="getSkillIconBg(skill)"
              >
                <component :is="getSkillIcon(skill)" class="size-5" />
              </div>

              <!-- 内容 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold text-sm">{{ skill.name }}</span>
                  <Badge variant="outline" class="text-xs">
                    {{ skillInputTypeConfig[skill.inputType]?.label || '未知' }}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {{ skill.description }}
                </p>
                <div v-if="skill.tags && skill.tags.length > 0" class="flex gap-1 mt-2 flex-wrap">
                  <Badge
                    v-for="tag in skill.tags"
                    :key="tag"
                    variant="secondary"
                    class="text-xs"
                  >
                    {{ tag }}
                  </Badge>
                </div>
              </div>

              <!-- 分配状态 -->
              <div class="shrink-0 flex items-center gap-1 text-sm">
                <template v-if="skill.checked">
                  <CheckIcon class="size-4 text-primary" />
                  <span class="text-primary font-medium">已分配</span>
                </template>
                <template v-else>
                  <XIcon class="size-4 text-muted-foreground" />
                  <span class="text-muted-foreground">未分配</span>
                </template>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12 text-muted-foreground mt-3">
        <SparklesIcon class="size-12 mx-auto mb-3 opacity-50" />
        <p>暂无 AI 工具</p>
      </div>
    </div>
  </div>
</template>
