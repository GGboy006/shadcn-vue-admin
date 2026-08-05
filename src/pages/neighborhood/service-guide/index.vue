<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'

import type { INeighborhoodServiceGuide, INeighborhoodServiceGuideListQuery } from '@/services/api/neighborhood-service-guide.api'

import { BasicPage } from '@/components/global-layout'
import NoResultFound from '@/components/no-result-found.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetServiceGuidePageQuery } from '@/services/api/neighborhood-service-guide.api'

import ServiceGuideCard from './components/service-guide-card.vue'
import ServiceGuideDeleteDialog from './components/service-guide-delete-dialog.vue'
import ServiceGuideFormSheet from './components/service-guide-form-sheet.vue'

// 用分页接口一次拉全量(pageSize=99),不展示分页组件
const query = ref<INeighborhoodServiceGuideListQuery>({
  pageNum: 1,
  pageSize: 99,
})

const { data, isLoading } = useGetServiceGuidePageQuery(query)

const list = computed(() => data.value?.data?.list ?? [])

// 新建 / 编辑 Sheet
const isFormOpen = ref(false)
const editingGuide = ref<INeighborhoodServiceGuide | undefined>(undefined)

function handleCreate() {
  editingGuide.value = undefined
  isFormOpen.value = true
}

function handleEdit(guide: INeighborhoodServiceGuide) {
  editingGuide.value = guide
  isFormOpen.value = true
}

// 删除确认
const isDeleteOpen = ref(false)
const deletingGuide = ref<INeighborhoodServiceGuide | undefined>(undefined)

function handleDelete(guide: INeighborhoodServiceGuide) {
  deletingGuide.value = guide
  isDeleteOpen.value = true
}
</script>

<template>
  <BasicPage
    title="服务热线"
    description="管理居委会的服务热线"
    sticky
  >
    <template #actions>
      <Button @click="handleCreate">
        <PlusIcon />
        新建服务热线
      </Button>
    </template>

    <!-- 加载态 -->
    <div v-if="isLoading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton v-for="i in 6" :key="i" class="h-[140px] w-full rounded-lg" />
    </div>

    <!-- 空态 -->
    <NoResultFound v-else-if="list.length === 0" />

    <!-- 卡片列表 -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ServiceGuideCard
        v-for="guide in list"
        :key="guide.uniqueCode"
        :guide="guide"
        @edit="handleEdit(guide)"
        @delete="handleDelete(guide)"
      />
    </div>

    <!-- 新建 / 编辑抽屉 -->
    <ServiceGuideFormSheet
      v-model:open="isFormOpen"
      :guide="editingGuide"
    />

    <!-- 删除确认 -->
    <ServiceGuideDeleteDialog
      v-model:open="isDeleteOpen"
      :guide="deletingGuide"
    />
  </BasicPage>
</template>
