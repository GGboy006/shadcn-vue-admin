<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { toast } from 'vue-sonner'

import type { IResidentAiToolAssignListQuery, IResidentAiToolAssignSkill } from '@/services/api/resident-ai-tool.api'

import { BasicPage } from '@/components/global-layout'
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAssignResidentAiToolMutation,
  useGetResidentAiToolAssignListQuery,
  useGetResidentAiToolCateListQuery,
} from '@/services/api/resident-ai-tool.api'

import SkillAssignCard from './components/skill-assign-card.vue'

const route = useRoute()
const router = useRouter()
const cateCode = computed(() => (route.params as Record<string, string>).cateCode)

/* ---------------- 分类名(无详情接口,取自 cate/list) ---------------- */
const { data: cateData } = useGetResidentAiToolCateListQuery()
const cateName = computed(() =>
  cateData.value?.data?.find(c => c.uniqueCode === cateCode.value)?.name ?? '',
)

/* ---------------- 候选工具列表 ---------------- */
// 只依赖 cateCode:搜索走前端过滤,避免重新请求把未保存的勾选重置掉
const assignQuery = computed<IResidentAiToolAssignListQuery>(() => ({ cateCode: cateCode.value }))
const { data, isLoading } = useGetResidentAiToolAssignListQuery(assignQuery)
const skillList = computed(() => data.value?.data ?? [])

const keyword = ref('')
const filteredList = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k)
    return skillList.value
  return skillList.value.filter(s => s.name?.toLowerCase().includes(k))
})

/* ---------------- 选中状态:original=后端真相,current=本地编辑态 ---------------- */
const original = ref<Set<string>>(new Set())
const current = ref<Set<string>>(new Set())

watch(skillList, (list) => {
  const checked = new Set(list.filter(s => s.checked).map(s => s.skillId))
  original.value = checked
  current.value = new Set(checked)
}, { immediate: true })

const added = computed(() => [...current.value].filter(id => !original.value.has(id)))
const removed = computed(() => [...original.value].filter(id => !current.value.has(id)))
const isDirty = computed(() => added.value.length > 0 || removed.value.length > 0)
const isClearing = computed(() => current.value.size === 0 && original.value.size > 0)

function isSelected(skill: IResidentAiToolAssignSkill): boolean {
  return current.value.has(skill.skillId)
}

function toggleSkill(skill: IResidentAiToolAssignSkill) {
  const next = new Set(current.value)
  if (next.has(skill.skillId))
    next.delete(skill.skillId)
  else
    next.add(skill.skillId)
  current.value = next
}

// 全选/清空只作用于「当前可见列表」:无搜索词时等价于全选/全清,
// 有搜索词时不会误伤被过滤掉的已选项
function handleSelectAll() {
  const next = new Set(current.value)
  for (const skill of filteredList.value)
    next.add(skill.skillId)
  current.value = next
}

function handleClearAll() {
  const next = new Set(current.value)
  for (const skill of filteredList.value)
    next.delete(skill.skillId)
  current.value = next
}

function handleResetChanges() {
  current.value = new Set(original.value)
}

/* ---------------- 保存(全量覆盖) ---------------- */
const { mutate: assign, isPending: isSaving } = useAssignResidentAiToolMutation()

const isConfirmOpen = ref(false)

const confirmTitle = computed(() =>
  isClearing.value ? '确认清空工具配置?' : '确认保存工具配置?',
)

const confirmDesc = computed(() => {
  if (isClearing.value)
    return '将清空该分类下全部AI工具,居民端将看不到任何AI工具,此操作不可撤销。'
  const parts: string[] = []
  if (added.value.length)
    parts.push(`新增 ${added.value.length} 个`)
  if (removed.value.length)
    parts.push(`移除 ${removed.value.length} 个`)
  return `将${parts.join('、')}工具,确认提交?`
})

function handleSaveClick() {
  if (!isDirty.value || isSaving.value)
    return
  isConfirmOpen.value = true
}

function handleConfirmSave() {
  assign(
    {
      cateCode: cateCode.value,
      skillIds: [...current.value],
    },
    {
      onSuccess: () => {
        toast.success('保存成功')
        isConfirmOpen.value = false
      },
      onError: (err: any) => {
        toast.error(err.message || '保存失败')
      },
    },
  )
}

/* ---------------- 未保存离开 ---------------- */
const isLeaveConfirmOpen = ref(false)
const leaveTo = ref<{ fullPath: string } | null>(null)
let skipLeaveGuard = false

onBeforeRouteLeave((to) => {
  if (skipLeaveGuard)
    return true
  if (isDirty.value) {
    leaveTo.value = { fullPath: to.fullPath }
    isLeaveConfirmOpen.value = true
    return false
  }
})

function handleConfirmLeave() {
  skipLeaveGuard = true
  isLeaveConfirmOpen.value = false
  if (leaveTo.value)
    router.push(leaveTo.value.fullPath)
}

function handleCancelLeave() {
  isLeaveConfirmOpen.value = false
  leaveTo.value = null
}
</script>

<template>
  <BasicPage
    :title="cateName ? `${cateName} · 工具配置` : 'AI工具配置'"
    description="勾选要对本小区居民开放的AI工具,本地编辑后统一保存(按分类整体覆盖)"
    sticky
  >
    <template #actions>
      <Button variant="ghost" size="sm" @click="router.push('/community/ai-tool')">
        返回
      </Button>
      <Button
        :variant="isClearing ? 'destructive' : 'default'"
        :disabled="!isDirty || isSaving"
        @click="handleSaveClick"
      >
        {{ isSaving ? '保存中...' : '保存' }}
      </Button>
    </template>

    <!-- 改动提示 -->
    <div v-if="isDirty" class="mb-3 flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm">
      <div>
        <template v-if="isClearing">
          ⚠ 将清空该分类下全部AI工具
        </template>
        <template v-else>
          未保存改动:
          <span v-if="added.length" class="font-medium text-emerald-600">+{{ added.length }}</span>
          <span v-if="added.length && removed.length" class="mx-1">·</span>
          <span v-if="removed.length" class="font-medium text-red-600">-{{ removed.length }}</span>
        </template>
      </div>
      <Button size="sm" variant="ghost" @click="handleResetChanges">
        撤销改动
      </Button>
    </div>

    <!-- 加载中 -->
    <div v-if="isLoading" class="space-y-3">
      <Skeleton v-for="i in 4" :key="i" class="h-24 w-full rounded-xl" />
    </div>

    <div v-else>
      <!-- 工具条 -->
      <div class="mb-3 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <Input
            v-model="keyword"
            placeholder="按工具名称筛选..."
            class="h-8 w-[180px] lg:w-[240px]"
          />
          <span class="text-sm text-muted-foreground">
            已选 {{ current.size }} / {{ skillList.length }} 个
          </span>
        </div>
        <div class="flex items-center gap-2">
          <Button size="sm" variant="outline" :disabled="filteredList.length === 0" @click="handleSelectAll">
            {{ keyword ? '选中筛选项' : '全选' }}
          </Button>
          <Button size="sm" variant="outline" :disabled="current.size === 0" @click="handleClearAll">
            {{ keyword ? '取消筛选项' : '清空' }}
          </Button>
        </div>
      </div>

      <!-- 空态 -->
      <div
        v-if="filteredList.length === 0"
        class="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground"
      >
        {{ keyword ? '没有匹配的AI工具' : '该分类暂无可配置的AI工具,请先在平台侧为本站长分配 Agent 技能' }}
      </div>

      <!-- 工具卡片列表 -->
      <div v-else class="space-y-3">
        <SkillAssignCard
          v-for="skill in filteredList"
          :key="skill.skillId"
          :skill="skill"
          :selected="isSelected(skill)"
          @toggle="toggleSkill(skill)"
        />
      </div>
    </div>

    <!-- 保存确认 -->
    <Modal v-model:open="isConfirmOpen">
      <ModalContent class="sm:max-w-md">
        <ModalHeader>
          <ModalTitle class="text-base">
            {{ confirmTitle }}
          </ModalTitle>
          <ModalDescription>
            {{ confirmDesc }}
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline" :disabled="isSaving" @click="isConfirmOpen = false">
            取消
          </Button>
          <Button
            :variant="isClearing ? 'destructive' : 'default'"
            :disabled="isSaving"
            @click="handleConfirmSave"
          >
            {{ isSaving ? '保存中...' : '确认保存' }}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    <!-- 未保存离开确认 -->
    <Modal :open="isLeaveConfirmOpen" @update:open="(v: boolean) => !v && handleCancelLeave()">
      <ModalContent class="sm:max-w-md">
        <ModalHeader>
          <ModalTitle class="text-base">
            放弃未保存的修改?
          </ModalTitle>
          <ModalDescription>
            当前有未保存的工具配置改动,离开后改动将丢失。
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline" @click="handleCancelLeave">
            继续编辑
          </Button>
          <Button variant="destructive" @click="handleConfirmLeave">
            放弃并离开
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </BasicPage>
</template>
