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

watch([allOrgs, selectedOrgId], ([list]) => {
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
  <div>
    <!-- 桌面：左侧机构列表限高自滚动，右侧人员表按内容展开 -->
    <div v-if="isDesktop" class="grid items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
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
    <div v-else class="min-h-0 flex-1">
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
