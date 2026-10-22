<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import ElderAllowanceCreate from './components/elder-allowance-create.vue'
import ElderAllowancePanel from './components/elder-allowance-panel.vue'
import ElderFlowPanel from './components/elder-flow-panel.vue'
import ElderMealPanel from './components/elder-meal-panel.vue'
import ElderPersonCreate from './components/elder-person-create.vue'
import ElderPersonPanel from './components/elder-person-panel.vue'
import ElderVisitCreate from './components/elder-visit-create.vue'
import ElderVisitPanel from './components/elder-visit-panel.vue'
import ElderVisitorCreate from './components/elder-visitor-create.vue'
import ElderVisitorPanel from './components/elder-visitor-panel.vue'

const tab = ref('meal')
</script>

<template>
  <BasicPage title="养老服务" description="助餐、津贴、申请流程和探访" sticky>
    <template #actions>
      <ElderPersonCreate v-if="tab === 'person'" />
      <ElderAllowanceCreate v-else-if="tab === 'allowance'" />
      <ElderVisitorCreate v-else-if="tab === 'visitor'" />
      <ElderVisitCreate v-else-if="tab === 'target'" />
    </template>

    <Tabs v-model="tab">
      <TabsList class="flex h-auto flex-wrap">
        <TabsTrigger value="meal">
          助餐
        </TabsTrigger>
        <TabsTrigger value="person">
          助餐老人
        </TabsTrigger>
        <TabsTrigger value="allowance">
          津贴标准
        </TabsTrigger>
        <TabsTrigger value="flow">
          申请流程
        </TabsTrigger>
        <TabsTrigger value="visitor">
          探访志愿者
        </TabsTrigger>
        <TabsTrigger value="target">
          探访对象
        </TabsTrigger>
      </TabsList>
      <TabsContent value="meal" class="mt-4">
        <ElderMealPanel />
      </TabsContent>
      <TabsContent value="person" class="mt-4">
        <ElderPersonPanel />
      </TabsContent>
      <TabsContent value="allowance" class="mt-4">
        <ElderAllowancePanel />
      </TabsContent>
      <TabsContent value="flow" class="mt-4">
        <ElderFlowPanel />
      </TabsContent>
      <TabsContent value="visitor" class="mt-4">
        <ElderVisitorPanel />
      </TabsContent>
      <TabsContent value="target" class="mt-4">
        <ElderVisitPanel />
      </TabsContent>
    </Tabs>
  </BasicPage>
</template>
