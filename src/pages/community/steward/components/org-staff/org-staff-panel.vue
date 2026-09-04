<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

import type { IHousekeeperServiceListQuery } from '@/services/api/housekeeper.api'

import { useLazyMount } from '@/composables/use-lazy-mount'
import { useGetHousekeeperServicePageQuery } from '@/services/api/housekeeper.api'

import ServiceEdit from '../service/service-edit.vue'
import OrgDetailPanel from './org-detail-panel.vue'
import OrgList from './org-list.vue'

const props = defineProps<{
  orgId?: string
}>()

const emit = defineEmits<{
  'update:orgId': [value: string | undefined]
}>()

const isDesktop = useMediaQuery('(min-width: 1024px)')

const orgQuery = ref<IHousekeeperServiceListQuery>({
  pageNum: 1,
  pageSize: 200,
})

const { data: orgData, isLoading } = useGetHousekeeperServicePageQuery(orgQuery)

const orgSearch = ref('')

const allOrgs = computed(() => orgData.value?.data?.list ?? [])

const filteredOrgs = computed(() => {
  const keyword = orgSearch.value.trim()
  if (!keyword)
    return allOrgs.value
  return allOrgs.value.filter(org => org.name.includes(keyword))
})

const selectedOrgId = computed({
  get: () => props.orgId,
  set: value => emit('update:orgId', value),
})

watch(allOrgs, (list) => {
  if (!list.length) {
    if (selectedOrgId.value)
      selectedOrgId.value = undefined
    return
  }
  if (selectedOrgId.value && list.some(o => o.housekeeperId === selectedOrgId.value))
    return
  if (isDesktop.value)
    selectedOrgId.value = list[0].housekeeperId
}, { immediate: true })

const mobileView = ref<'list' | 'detail'>('list')

watch(isDesktop, (desktop) => {
  if (desktop)
    mobileView.value = 'list'
})

function handleSelectOrg(id: string) {
  selectedOrgId.value = id
  if (!isDesktop.value)
    mobileView.value = 'detail'
}

function handleBackToList() {
  mobileView.value = 'list'
}

const isCreateOpen = ref(false)
const isCreateOpenRendered = useLazyMount(isCreateOpen)

function handleOrgCreated() {
  // 列表刷新由 mutation invalidate 触发；新建后选中第一项由 watch 处理
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-muted-foreground">
      先配置服务机构与人员，再在「展示分类与分配」里把人员挂到居民可见的类目上。
    </p>

    <!-- 桌面：左右主从 -->
    <div v-if="isDesktop" class="grid min-h-[560px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      <OrgList
        :loading="isLoading"
        :orgs="filteredOrgs"
        :selected-id="selectedOrgId"
        :search="orgSearch"
        @update:search="orgSearch = $event"
        @select="handleSelectOrg"
        @create="isCreateOpen = true"
      />
      <OrgDetailPanel :org-id="selectedOrgId" />
    </div>

    <!-- 移动：列表 ↔ 详情 -->
    <div v-else class="min-h-[560px]">
      <OrgList
        v-if="mobileView === 'list'"
        :loading="isLoading"
        :orgs="filteredOrgs"
        :selected-id="selectedOrgId"
        :search="orgSearch"
        @update:search="orgSearch = $event"
        @select="handleSelectOrg"
        @create="isCreateOpen = true"
      />
      <OrgDetailPanel
        v-else
        :org-id="selectedOrgId"
        show-back
        @back="handleBackToList"
      />
    </div>

    <ServiceEdit
      v-if="isCreateOpenRendered"
      v-model:open="isCreateOpen"
      @close="isCreateOpen = false; handleOrgCreated()"
    />
  </div>
</template>
