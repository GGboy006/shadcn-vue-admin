<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import PointAccountPanel from './components/point-account-panel.vue'
import PointExchangeCreate from './components/point-exchange-create.vue'
import PointExchangePanel from './components/point-exchange-panel.vue'
import PointGoodsCreate from './components/point-goods-create.vue'
import PointGoodsPanel from './components/point-goods-panel.vue'
import PointRuleCreate from './components/point-rule-create.vue'
import PointRulePanel from './components/point-rule-panel.vue'

const tab = ref('rule')
</script>

<template>
  <BasicPage title="积分管理" description="规则、账户、商品和兑换" sticky>
    <template #actions>
      <PointRuleCreate v-if="tab === 'rule'" />
      <PointGoodsCreate v-else-if="tab === 'goods'" />
      <PointExchangeCreate v-else-if="tab === 'exchange'" />
    </template>

    <Tabs v-model="tab">
      <TabsList class="flex h-auto flex-wrap">
        <TabsTrigger value="rule">
          积分规则
        </TabsTrigger>
        <TabsTrigger value="account">
          积分账户
        </TabsTrigger>
        <TabsTrigger value="goods">
          积分商品
        </TabsTrigger>
        <TabsTrigger value="exchange">
          兑换记录
        </TabsTrigger>
      </TabsList>
      <TabsContent value="rule" class="mt-4">
        <PointRulePanel />
      </TabsContent>
      <TabsContent value="account" class="mt-4">
        <PointAccountPanel />
      </TabsContent>
      <TabsContent value="goods" class="mt-4">
        <PointGoodsPanel />
      </TabsContent>
      <TabsContent value="exchange" class="mt-4">
        <PointExchangePanel />
      </TabsContent>
    </Tabs>
  </BasicPage>
</template>
