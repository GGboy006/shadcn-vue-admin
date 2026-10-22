<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import VolunteerApplyPanel from './components/volunteer-apply-panel.vue'
import VolunteerCreate from './components/volunteer-create.vue'
import VolunteerPanel from './components/volunteer-panel.vue'

const tab = ref('roster')
</script>

<template>
  <BasicPage title="志愿服务" description="志愿者名册和报名审核" sticky>
    <template #actions>
      <VolunteerCreate v-if="tab === 'roster'" />
    </template>

    <Tabs v-model="tab">
      <TabsList class="flex h-auto flex-wrap">
        <TabsTrigger value="roster">
          志愿者
        </TabsTrigger>
        <TabsTrigger value="apply">
          报名审核
        </TabsTrigger>
      </TabsList>
      <TabsContent value="roster" class="mt-4">
        <VolunteerPanel />
      </TabsContent>
      <TabsContent value="apply" class="mt-4">
        <VolunteerApplyPanel />
      </TabsContent>
    </Tabs>
  </BasicPage>
</template>
