<script setup lang="ts">
import { LoaderIcon } from '@lucide/vue'

import { BasicPage } from '@/components/global-layout'

import { columns } from './components/columns'
import DataTable from './components/data-table.vue'
import UserCreate from './components/user-create.vue'
import UserInvite from './components/user-invite.vue'
import { users } from './data/users'

const loading = ref(false)

function mockLoading() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<template>
  <BasicPage
    title="用户管理"
    description="管理系统用户账号"
    sticky
  >
    <template #actions>
      <UserInvite />
      <UserCreate />
      <UiButton variant="outline" @click="mockLoading">
        <LoaderIcon />模拟加载
      </UiButton>
    </template>
    <div class="overflow-x-auto">
      <DataTable :loading :data="users" :columns="columns" />
    </div>
  </BasicPage>
</template>
