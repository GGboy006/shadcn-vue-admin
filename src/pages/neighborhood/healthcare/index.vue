<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import HealthBookPanel from './components/health-book-panel.vue'
import HealthCreate from './components/health-create.vue'
import HealthPanel from './components/health-panel.vue'
import HealthSignCreate from './components/health-sign-create.vue'
import HealthSignPanel from './components/health-sign-panel.vue'

const tab = ref('record')
</script>

<template>
  <BasicPage title="医疗健康" description="健康档案、家庭医生签约和挂号入口" sticky>
    <template #actions>
      <HealthCreate v-if="tab === 'record'" />
      <HealthSignCreate v-else-if="tab === 'sign'" />
    </template>

    <Tabs v-model="tab">
      <TabsList class="flex h-auto flex-wrap">
        <TabsTrigger value="record">
          健康档案
        </TabsTrigger>
        <TabsTrigger value="sign">
          家庭医生签约
        </TabsTrigger>
        <TabsTrigger value="book">
          挂号
        </TabsTrigger>
      </TabsList>
      <TabsContent value="record" class="mt-4">
        <HealthPanel />
      </TabsContent>
      <TabsContent value="sign" class="mt-4">
        <HealthSignPanel />
      </TabsContent>
      <TabsContent value="book" class="mt-4">
        <HealthBookPanel />
      </TabsContent>
    </Tabs>
  </BasicPage>
</template>
