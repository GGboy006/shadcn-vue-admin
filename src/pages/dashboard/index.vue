<script lang="ts" setup>
import { toast } from 'vue-sonner'

import { BasicPage } from '@/components/global-layout'
import { Button } from '@/components/ui/button'

import OverviewContent from './components/overview-content.vue'

const tabs = ref([
  { name: '概览', value: 'overview' },
  { name: '分析', value: 'analytics', disabled: true },
  { name: '报表', value: 'reports', disabled: true },
  { name: '通知', value: 'notifications', disabled: true },
])

const activeTab = ref(tabs.value[0].value)
</script>

<template>
  <BasicPage
    title="工作台"
    description="工作区概览"
    sticky
  >
    <template #actions>
      <Button
        @click="() => toast('hello', {
          position: 'top-center',
        })"
      >
        {{ $t('download') }}
      </Button>
    </template>

    <UiTabs :default-value="activeTab" class="w-full">
      <UiTabsList>
        <UiTabsTrigger
          v-for="tab in tabs" :key="tab.value"
          :value="tab.value"
          :disabled="tab.disabled"
        >
          {{ tab.name }}
        </UiTabsTrigger>
      </UiTabsList>
      <UiTabsContent value="overview" class="space-y-4">
        <OverviewContent />
      </UiTabsContent>
    </UiTabs>
  </BasicPage>
</template>
