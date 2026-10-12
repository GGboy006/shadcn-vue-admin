<script setup lang="ts">
import { toast } from 'vue-sonner'

import type { CategoryAssignmentDraft } from '@/services/api/housekeeper-assignment'

import { FormSheet, FormSheetContent, FormSheetDescription, FormSheetHeader, FormSheetTitle } from '@/components/prop-ui/form-sheet'
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  assignmentKey,
  assignmentPersonLabel,
  buildCategoryProviderPayload,
  decorateAssignment,
} from '@/services/api/housekeeper-assignment'
import {
  useGetHousekeeperCategoryDetailQuery,
  useGetHousekeeperCategoryProvidersQuery,
  useGetHousekeeperServiceListQuery,
  useSaveHousekeeperCategoryProvidersMutation,
} from '@/services/api/housekeeper.api'

import ProviderPicker from './provider-picker.vue'

const props = defineProps<{
  open: boolean
  categoryId?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const pendingClose = ref(false)

const categoryIdRef = computed(() => props.categoryId)

const { data: categoryData } = useGetHousekeeperCategoryDetailQuery(categoryIdRef, computed(() => props.open && !!props.categoryId))
const categoryName = computed(() => categoryData.value?.data?.categoryName ?? '')

const listEnabled = computed(() => props.open && !!props.categoryId)
const { data: providersData, isLoading } = useGetHousekeeperCategoryProvidersQuery(categoryIdRef, listEnabled)
const { data: serviceListData } = useGetHousekeeperServiceListQuery(listEnabled)

const original = ref<CategoryAssignmentDraft[]>([])
const current = ref<CategoryAssignmentDraft[]>([])

function applyServerRows() {
  const services = serviceListData.value?.data ?? []
  const rows = (providersData.value?.data ?? []).map(item => decorateAssignment(item, services))
  original.value = rows
  current.value = rows.map(item => ({ ...item }))
}

watch(providersData, () => {
  applyServerRows()
}, { immediate: true })

function sameRow(left: CategoryAssignmentDraft, right: CategoryAssignmentDraft) {
  return assignmentKey(left) === assignmentKey(right)
}

const added = computed(() =>
  current.value.filter(item => !original.value.some(saved => sameRow(saved, item))))
const removed = computed(() =>
  original.value.filter(item => !current.value.some(draft => sameRow(draft, item))))

const isDirty = computed(() => {
  if (current.value.length !== original.value.length)
    return true
  return current.value.some((item) => {
    const saved = original.value.find(row => sameRow(row, item))
    return !saved || saved.sortOrder !== item.sortOrder
  })
})

watch(serviceListData, () => {
  if (!isDirty.value)
    applyServerRows()
})

const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value && isDirty.value) {
      pendingClose.value = true
      return
    }
    emit('update:open', value)
    if (!value)
      emit('close')
  },
})

const isClearing = computed(() => current.value.length === 0 && original.value.length > 0)

const isPickerOpen = ref(false)

function handleAdd(item: CategoryAssignmentDraft) {
  if (current.value.some(row => sameRow(row, item)))
    return
  current.value.push({ ...item, sortOrder: current.value.length + 1 })
}

function handleRemove(item: Pick<CategoryAssignmentDraft, 'housekeeperId' | 'staffId' | 'providerType'>) {
  const key = assignmentKey(item)
  current.value = current.value.filter(row => assignmentKey(row) !== key)
}

function handleSortChange(key: string, val: string | number) {
  const item = current.value.find(row => assignmentKey(row) === key)
  if (item)
    item.sortOrder = val === '' ? 0 : Number(val)
}

const { mutate: save, isPending: isSaving } = useSaveHousekeeperCategoryProvidersMutation()

const isConfirmOpen = ref(false)

const confirmTitle = computed(() => {
  if (isClearing.value)
    return '确认清空分配?'
  return '确认保存分配?'
})

const confirmDesc = computed(() => {
  if (isClearing.value)
    return '此操作将清空该分类下的全部分配，该操作不可撤销。'
  const parts: string[] = []
  if (added.value.length)
    parts.push(`新增 ${added.value.length} 条`)
  if (removed.value.length)
    parts.push(`移除 ${removed.value.length} 条`)
  if (parts.length === 0)
    return '将提交排序调整。保存会覆盖该分类现有的全部分配。'
  return `将${parts.join('、')}。保存会覆盖该分类现有的全部分配。`
})

function handleSaveClick() {
  if (!isDirty.value || isSaving.value || !props.categoryId)
    return
  isConfirmOpen.value = true
}

function handleConfirmSave() {
  if (!props.categoryId)
    return
  save(
    {
      categoryId: props.categoryId,
      providers: buildCategoryProviderPayload(current.value),
    },
    {
      onSuccess: () => {
        toast.success('保存成功')
        isConfirmOpen.value = false
        emit('update:open', false)
        emit('close')
      },
      onError: (err: Error) => {
        toast.error(err.message || '保存失败')
      },
    },
  )
}

function handleConfirmDiscardClose() {
  pendingClose.value = false
  emit('update:open', false)
  emit('close')
}

function handleCancelDiscardClose() {
  pendingClose.value = false
}
</script>

<template>
  <FormSheet v-model:open="isOpen">
    <FormSheetContent class="md:max-w-3xl">
      <FormSheetHeader class="border-b px-4 py-3">
        <div class="flex items-center justify-between gap-3">
          <div>
            <FormSheetTitle class="text-base">
              分配：{{ categoryName || '加载中...' }}
            </FormSheetTitle>
            <FormSheetDescription class="mt-1 text-xs">
              本地馆勾选师傅，第三方只选服务主体。保存会覆盖该分类现有的全部分配。
            </FormSheetDescription>
          </div>
          <Button :disabled="!isDirty || isSaving" @click="handleSaveClick">
            {{ isSaving ? '保存中...' : '保存' }}
          </Button>
        </div>
      </FormSheetHeader>

      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="isDirty" class="mb-3 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm">
          <template v-if="isClearing">
            ⚠ 将清空全部分配
          </template>
          <template v-else>
            未保存改动:
            <span v-if="added.length" class="font-medium text-emerald-600">+{{ added.length }}</span>
            <span v-if="added.length && removed.length" class="mx-1">·</span>
            <span v-if="removed.length" class="font-medium text-red-600">-{{ removed.length }}</span>
            <span v-if="!added.length && !removed.length" class="text-muted-foreground">(排序调整)</span>
          </template>
        </div>

        <div v-if="isLoading" class="space-y-2">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>

        <div v-else>
          <div class="mb-3 flex items-center justify-between">
            <span class="text-sm text-muted-foreground">当前已分配 {{ current.length }} 条</span>
            <Button size="sm" variant="outline" @click="isPickerOpen = true">
              + 添加
            </Button>
          </div>

          <div v-if="current.length === 0" class="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
            暂未分配。本地馆选择师傅，第三方选择服务主体。
          </div>

          <div v-else class="overflow-hidden rounded-md border">
            <table class="w-full text-sm">
              <thead class="bg-muted/50">
                <tr>
                  <th class="px-3 py-2 text-left font-medium">
                    服务机构
                  </th>
                  <th class="px-3 py-2 text-left font-medium">
                    人员
                  </th>
                  <th class="w-24 px-3 py-2 text-left font-medium">
                    排序
                  </th>
                  <th class="w-20 px-3 py-2 text-right font-medium">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in current"
                  :key="assignmentKey(item)"
                  class="border-t"
                >
                  <td class="px-3 py-2 text-muted-foreground">
                    {{ item.housekeeperName || '-' }}
                  </td>
                  <td class="px-3 py-2 font-medium">
                    {{ assignmentPersonLabel(item) }}
                  </td>
                  <td class="px-3 py-2">
                    <Input
                      type="number"
                      :model-value="item.sortOrder"
                      class="h-8 w-20"
                      @update:model-value="(val: string | number) => handleSortChange(assignmentKey(item), val)"
                    />
                  </td>
                  <td class="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" class="text-destructive hover:text-destructive" @click="handleRemove(item)">
                      移除
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FormSheetContent>
  </FormSheet>

  <ProviderPicker
    v-model:open="isPickerOpen"
    :assigned="current"
    @add="handleAdd"
    @remove="handleRemove"
  />

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

  <Modal :open="pendingClose" @update:open="(v: boolean) => !v && handleCancelDiscardClose()">
    <ModalContent class="sm:max-w-md">
      <ModalHeader>
        <ModalTitle class="text-base">
          确认关闭?
        </ModalTitle>
        <ModalDescription>
          您有未保存的分配改动，关闭后将丢失。
        </ModalDescription>
      </ModalHeader>
      <ModalFooter>
        <Button variant="outline" @click="handleCancelDiscardClose">
          继续编辑
        </Button>
        <Button variant="destructive" @click="handleConfirmDiscardClose">
          放弃改动
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
</template>
