<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import EnvCompareCreate from './components/env-compare-create.vue'
import EnvComparePanel from './components/env-compare-panel.vue'
import EnvHeader from './components/env-header.vue'
import EnvNewsCreate from './components/env-news-create.vue'
import EnvNewsPanel from './components/env-news-panel.vue'

const tab = ref('news')
</script>

<template>
  <BasicPage title="环境治理" description="村情三项指标、整治动态和整改对比" sticky>
    <template #actions>
      <EnvNewsCreate v-if="tab === 'news'" />
      <EnvCompareCreate v-else-if="tab === 'compare'" />
    </template>

    <EnvHeader />
    <Tabs v-model="tab">
      <TabsList class="flex h-auto flex-wrap">
        <TabsTrigger value="news">
          整治动态
        </TabsTrigger>
        <TabsTrigger value="compare">
          整改对比
        </TabsTrigger>
      </TabsList>
      <TabsContent value="news" class="mt-4">
        <EnvNewsPanel />
      </TabsContent>
      <TabsContent value="compare" class="mt-4">
        <EnvComparePanel />
      </TabsContent>
    </Tabs>
  </BasicPage>
</template>
