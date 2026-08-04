<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'

import type { INeighborhoodCate } from '@/services/api/neighborhood-cate.api'

import { BasicPage } from '@/components/global-layout'
import NoResultFound from '@/components/no-result-found.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetCateAllQuery } from '@/services/api/neighborhood-cate.api'

import CateCard from './components/cate-card.vue'
import CateDeleteDialog from './components/cate-delete-dialog.vue'
import CateFormSheet from './components/cate-form-sheet.vue'

const { data, isLoading } = useGetCateAllQuery()

const list = computed(() => data.value?.data ?? [])

// 新建 / 编辑 Sheet
const isFormOpen = ref(false)
const editingCate = ref<INeighborhoodCate | undefined>(undefined)

function handleCreate() {
  editingCate.value = undefined
  isFormOpen.value = true
}

function handleEdit(cate: INeighborhoodCate) {
  editingCate.value = cate
  isFormOpen.value = true
}

// 删除确认
const isDeleteOpen = ref(false)
const deletingCate = ref<INeighborhoodCate | undefined>(undefined)

function handleDelete(cate: INeighborhoodCate) {
  deletingCate.value = cate
  isDeleteOpen.value = true
}
</script>

<template>
  <BasicPage
    title="活动分类"
    description="管理居委会活动的分类"
    sticky
  >
    <template #actions>
      <Button @click="handleCreate">
        <PlusIcon />
        新建分类
      </Button>
    </template>

    <!-- 加载态 -->
    <div v-if="isLoading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton v-for="i in 6" :key="i" class="h-[117px] w-full rounded-lg" />
    </div>

    <!-- 空态 -->
    <NoResultFound v-else-if="list.length === 0" />

    <!-- 卡片列表 -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <CateCard
        v-for="cate in list"
        :key="cate.uniqueCode"
        :cate="cate"
        @edit="handleEdit(cate)"
        @delete="handleDelete(cate)"
      />
    </div>

    <!-- 新建 / 编辑抽屉 -->
    <CateFormSheet
      v-model:open="isFormOpen"
      :cate="editingCate"
    />

    <!-- 删除确认 -->
    <CateDeleteDialog
      v-model:open="isDeleteOpen"
      :cate="deletingCate"
    />
  </BasicPage>
</template>
