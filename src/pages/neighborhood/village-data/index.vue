<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import OpenContentPanel from '../components/open-content-panel.vue'
import MemberCreate from './components/member-create.vue'
import MemberPanel from './components/member-panel.vue'
import StatCreate from './components/stat-create.vue'
import StatPanel from './components/stat-panel.vue'

const tab = ref('stat')
</script>

<template>
  <BasicPage title="村情数据" description="维护村情指标、班子成员和村务公开" sticky>
    <template #actions>
      <StatCreate v-if="tab === 'stat'" />
      <MemberCreate v-else-if="tab === 'member'" />
    </template>

    <Tabs v-model="tab">
      <TabsList>
        <TabsTrigger value="stat">
          指标管理
        </TabsTrigger>
        <TabsTrigger value="member">
          班子成员
        </TabsTrigger>
        <TabsTrigger value="open">
          村务公开
        </TabsTrigger>
      </TabsList>
      <TabsContent value="stat" class="mt-4">
        <StatPanel />
      </TabsContent>
      <TabsContent value="member" class="mt-4">
        <MemberPanel />
      </TabsContent>
      <TabsContent value="open" class="mt-4">
        <OpenContentPanel :type="1" label="村务公开" />
      </TabsContent>
    </Tabs>
  </BasicPage>
</template>
