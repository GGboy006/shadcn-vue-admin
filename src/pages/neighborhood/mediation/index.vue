<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import MediateCreate from './components/mediate-create.vue'
import MediatePanel from './components/mediate-panel.vue'
import MediatorCreate from './components/mediator-create.vue'
import MediatorPanel from './components/mediator-panel.vue'

const tab = ref('mediator')
</script>

<template>
  <BasicPage title="矛盾调解" description="调解员台账和纠纷申请" sticky>
    <template #actions>
      <MediatorCreate v-if="tab === 'mediator'" />
      <MediateCreate v-else-if="tab === 'case'" />
    </template>

    <Tabs v-model="tab">
      <TabsList class="flex h-auto flex-wrap">
        <TabsTrigger value="mediator">
          调解员
        </TabsTrigger>
        <TabsTrigger value="case">
          调解申请
        </TabsTrigger>
      </TabsList>
      <TabsContent value="mediator" class="mt-4">
        <MediatorPanel />
      </TabsContent>
      <TabsContent value="case" class="mt-4">
        <MediatePanel />
      </TabsContent>
    </Tabs>
  </BasicPage>
</template>
