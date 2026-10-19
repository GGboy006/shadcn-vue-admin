<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { useOwnHousekeeperService } from '@/composables/use-own-housekeeper'

import OrgDetailPanel from '../../community/steward/components/org-staff/org-detail-panel.vue'

const { housekeeperId, isLoading } = useOwnHousekeeperService()
</script>

<template>
  <BasicPage
    title="服务人员"
    description="维护本馆师傅。新增后会同步城市 App 账号"
    sticky
  >
    <OrgDetailPanel
      v-if="housekeeperId"
      :org-id="housekeeperId"
      manage-mode="self"
    />
    <p v-else class="text-sm text-muted-foreground">
      {{ isLoading ? '正在加载本馆人员...' : '没有找到本馆' }}
    </p>
  </BasicPage>
</template>
