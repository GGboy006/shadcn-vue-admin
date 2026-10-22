<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import FireArticleCreate from './components/fire-article-create.vue'
import FireArticlePanel from './components/fire-article-panel.vue'
import FireNotePanel from './components/fire-note-panel.vue'
import FirePhoneCreate from './components/fire-phone-create.vue'
import FirePhonePanel from './components/fire-phone-panel.vue'

const tab = ref('article')
</script>

<template>
  <BasicPage title="消防安全" description="科普文章、应急电话和联防机制" sticky>
    <template #actions>
      <FireArticleCreate v-if="tab === 'article'" />
      <FirePhoneCreate v-else-if="tab === 'phone'" />
    </template>

    <Tabs v-model="tab">
      <TabsList class="flex h-auto flex-wrap">
        <TabsTrigger value="article">
          科普文章
        </TabsTrigger>
        <TabsTrigger value="phone">
          应急电话
        </TabsTrigger>
        <TabsTrigger value="note">
          联防机制
        </TabsTrigger>
      </TabsList>
      <TabsContent value="article" class="mt-4">
        <FireArticlePanel />
      </TabsContent>
      <TabsContent value="phone" class="mt-4">
        <FirePhonePanel />
      </TabsContent>
      <TabsContent value="note" class="mt-4">
        <FireNotePanel />
      </TabsContent>
    </Tabs>
  </BasicPage>
</template>
