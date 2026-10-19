<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'

import { BasicPage } from '@/components/global-layout'
import { Button } from '@/components/ui/button'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { useGetPartnerStaffQuery } from '@/services/api/housekeeper-partner.api'

import { columns } from './columns'
import DataTableToolbar from './data-table-toolbar.vue'
import DataTable from './data-table.vue'
import StaffSheet from './staff-sheet.vue'

const { data, isLoading } = useGetPartnerStaffQuery()
const search = ref('')

const list = computed(() => {
  const rows = data.value?.data ?? []
  const keyword = search.value.trim()
  if (!keyword)
    return rows
  return rows.filter(item => item.staffName.includes(keyword) || item.phone?.includes(keyword))
})

const isCreateOpen = ref(false)
const isCreateRendered = useLazyMount(isCreateOpen)
</script>

<template>
  <BasicPage
    title="服务人员"
    description="维护合作方人员。停用后站长下拉和居民卡片不再出现这个人"
    sticky
  >
    <template #actions>
      <Button @click="isCreateOpen = true">
        <PlusIcon />
        新建人员
      </Button>
    </template>

    <DataTable :loading="isLoading" :data="list" :columns="columns">
      <template #toolbar="{ table }">
        <DataTableToolbar :table="table" :search="search" @update:search="search = $event" />
      </template>
    </DataTable>

    <StaffSheet v-if="isCreateRendered" v-model:open="isCreateOpen" @close="isCreateOpen = false" />
  </BasicPage>
</template>
