<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { toast } from 'vue-sonner'

import type { IHousekeeperCategoryProviderVO } from '@/services/api/housekeeper.api'

import { BasicPage } from '@/components/global-layout'
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useGetHousekeeperCategoryDetailQuery,
  useGetHousekeeperCategoryProvidersQuery,
  useSaveHousekeeperCategoryProvidersMutation,
} from '@/services/api/housekeeper.api'

import ProviderPicker from './components/category/provider-picker.vue'

interface ProviderItem {
  housekeeperId: string
  staffId: string
  housekeeperName?: string
  staffName?: string
  sortOrder: number
}

const route = useRoute()
const router = useRouter()
const categoryId = computed(() => (route.params as Record<string, string>).categoryId)

// 分类详情(标题用)
const { data: categoryData } = useGetHousekeeperCategoryDetailQuery(categoryId)
const categoryName = computed(() => categoryData.value?.data?.categoryName ?? '')

// 已分配列表
const { data: providersData, isLoading } = useGetHousekeeperCategoryProvidersQuery(categoryId)

// original: 后端真相(含 id)
const original = ref<IHousekeeperCategoryProviderVO[]>([])

// current: 本地编辑态
const current = ref<ProviderItem[]>([])

// providersData 变化时同步 original 与 current
watch(providersData, (val) => {
  const list = val?.data ?? []
  original.value = list.map(p => ({ ...p }))
  current.value = list.map(p => ({
    housekeeperId: p.housekeeperId,
    staffId: p.staffId ?? '',
    housekeeperName: p.housekeeperName,
    staffName: p.staffName,
    sortOrder: p.sortOrder ?? 0,
  }))
}, { immediate: true })

// diff
const added = computed(() =>
  current.value.filter(c => !original.value.some(o => o.staffId === c.staffId)))
const removed = computed(() =>
  original.value.filter(o => !current.value.some(c => c.staffId === o.staffId)))

const isDirty = computed(() => {
  if (current.value.length !== original.value.length)
    return true
  for (const c of current.value) {
    const o = original.value.find(o => o.staffId === c.staffId)
    if (!o)
      return true
    if ((o.sortOrder ?? 0) !== c.sortOrder)
      return true
  }
  return false
})

const isClearing = computed(() => current.value.length === 0 && original.value.length > 0)

const currentStaffIds = computed(() => new Set(current.value.map(c => c.staffId)))

/* ---------------- 添加弹窗 ---------------- */
const isPickerOpen = ref(false)

function handleAdd(item: ProviderItem) {
  if (current.value.some(c => c.staffId === item.staffId))
    return
  // 新增项给末尾排序
  item.sortOrder = current.value.length + 1
  current.value.push(item)
}

function handleRemoveByStaff(staffId: string) {
  current.value = current.value.filter(c => c.staffId !== staffId)
}

/* ---------------- 行操作 ---------------- */
function handleRemove(staffId: string) {
  current.value = current.value.filter(c => c.staffId !== staffId)
}

function handleSortChange(staffId: string, val: string | number) {
  const item = current.value.find(c => c.staffId === staffId)
  if (item)
    item.sortOrder = val === '' ? 0 : Number(val)
}

/* ---------------- 保存 ---------------- */
const { mutate: save, isPending: isSaving } = useSaveHousekeeperCategoryProvidersMutation()

const isConfirmOpen = ref(false)

const confirmTitle = computed(() => {
  if (isClearing.value)
    return '确认清空人员分配?'
  return '确认保存人员分配?'
})

const confirmDesc = computed(() => {
  if (isClearing.value)
    return '此操作将清空该分类下所有已分配人员,该操作不可撤销。'
  const parts: string[] = []
  if (added.value.length)
    parts.push(`新增 ${added.value.length} 人`)
  if (removed.value.length)
    parts.push(`移除 ${removed.value.length} 人`)
  if (parts.length === 0)
    return '将提交排序调整。'
  return `将${parts.join('、')},确认提交?`
})

function handleSaveClick() {
  if (!isDirty.value || isSaving.value)
    return
  isConfirmOpen.value = true
}

function handleConfirmSave() {
  save(
    {
      categoryId: categoryId.value,
      providers: current.value.map(c => ({
        housekeeperId: c.housekeeperId,
        staffId: c.staffId,
        sortOrder: c.sortOrder,
      })),
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
    :title="categoryName ? `${categoryName} · 人员分配` : '分类人员分配'"
    description="管理该分类下展示的服务人员,本地编辑后统一保存"
    sticky
  >
    <template #actions>
      <UiButton variant="ghost" size="sm" @click="router.push('/community/steward')">
        返回
      </UiButton>
      <Button :disabled="!isDirty || isSaving" @click="handleSaveClick">
        {{ isSaving ? '保存中...' : '保存' }}
      </Button>
    </template>

    <!-- 改动提示 -->
    <div v-if="isDirty" class="mb-3 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm">
      <template v-if="isClearing">
        ⚠ 将清空所有人员分配
      </template>
      <template v-else>
        未保存改动:
        <span v-if="added.length" class="font-medium text-emerald-600">+{{ added.length }}</span>
        <span v-if="added.length && removed.length" class="mx-1">·</span>
        <span v-if="removed.length" class="font-medium text-red-600">-{{ removed.length }}</span>
        <span v-if="!added.length && !removed.length" class="text-muted-foreground">(排序调整)</span>
      </template>
    </div>

    <!-- 已分配列表 -->
    <div v-if="isLoading" class="space-y-2">
      <Skeleton class="h-12 w-full" />
      <Skeleton class="h-12 w-full" />
      <Skeleton class="h-12 w-full" />
    </div>

    <div v-else>
      <div class="mb-3 flex items-center justify-between">
        <span class="text-sm text-muted-foreground">当前已分配 {{ current.length }} 人</span>
        <Button size="sm" variant="outline" @click="isPickerOpen = true">
          + 添加人员
        </Button>
      </div>

      <div v-if="current.length === 0" class="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
        暂未分配人员,点击「添加人员」开始
      </div>

      <div v-else class="overflow-hidden rounded-md border">
        <table class="w-full text-sm">
          <thead class="bg-muted/50">
            <tr>
              <th class="px-3 py-2 text-left font-medium">
                服务主体
              </th>
              <th class="px-3 py-2 text-left font-medium">
                人员
              </th>
              <th class="px-3 py-2 text-left font-medium w-24">
                排序
              </th>
              <th class="px-3 py-2 text-right font-medium w-20">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in current"
              :key="item.staffId"
              class="border-t"
            >
              <td class="px-3 py-2 text-muted-foreground">
                {{ item.housekeeperName || '-' }}
              </td>
              <td class="px-3 py-2 font-medium">
                {{ item.staffName || '-' }}
              </td>
              <td class="px-3 py-2">
                <Input
                  type="number"
                  :model-value="item.sortOrder"
                  class="h-8 w-20"
                  @update:model-value="(val: string | number) => handleSortChange(item.staffId, val)"
                />
              </td>
              <td class="px-3 py-2 text-right">
                <Button size="sm" variant="ghost" class="text-destructive hover:text-destructive" @click="handleRemove(item.staffId)">
                  移除
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加人员弹窗 -->
    <ProviderPicker
      v-model:open="isPickerOpen"
      :current-staff-ids="currentStaffIds"
      @add="handleAdd"
      @remove="handleRemoveByStaff"
    />

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
            {{ isSaving ? '保存中...' : '确认' }}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    <!-- 未保存离开确认 -->
    <Modal :open="isLeaveConfirmOpen" @update:open="(v: boolean) => !v && handleCancelLeave()">
      <ModalContent class="sm:max-w-md">
        <ModalHeader>
          <ModalTitle class="text-base">
            确认离开?
          </ModalTitle>
          <ModalDescription>
            您有未保存的改动,离开后将丢失。确定离开?
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline" @click="handleCancelLeave">
            继续编辑
          </Button>
          <Button variant="destructive" @click="handleConfirmLeave">
            确认离开
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </BasicPage>
</template>
