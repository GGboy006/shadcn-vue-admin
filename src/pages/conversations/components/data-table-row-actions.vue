<script setup lang="ts">
import type { IConversation } from '@/services/api/conversation.api'

import { DataTableRowActions } from '@/components/data-table'

import { getConversationDetailRoute } from '../utils/navigation'

interface Props {
  row: IConversation
}

const props = defineProps<Props>()
const router = useRouter()

function handleViewDetail() {
  router.push(getConversationDetailRoute(props.row))
}
</script>

<template>
  <DataTableRowActions
    mode="buttons"
    :show-edit="false"
    :show-delete="false"
    view-text="查看详情"
    @view="handleViewDetail"
  />
</template>
