<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'

import { columns } from './components/columns'
import DataTable from './components/data-table.vue'
import TaskCreate from './components/task-create.vue'
import TaskImport from './components/task-import.vue'
import tasks from './data/tasks.json'
</script>

<template>
  <BasicPage
    title="任务管理"
    description="管理系统任务"
    sticky
  >
    <template #actions>
      <TaskImport />
      <TaskCreate />
    </template>
    <div class="overflow-x-auto">
      <DataTable :data="tasks" :columns="columns" />
    </div>
  </BasicPage>
</template>
