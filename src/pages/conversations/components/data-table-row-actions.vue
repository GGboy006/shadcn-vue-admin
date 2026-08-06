<script setup lang="ts">
import { EyeIcon } from '@lucide/vue'

import type { IConversation } from '@/services/api/conversation.api'

import { DataTableRowActions } from '@/components/data-table'

import { getConversationDetailRoute } from '../utils/navigation'

interface Props {
  row: IConversation
}

const props = defineProps<Props>()
const router = useRouter()

const items = [
  { key: 'view', label: '查看详情', icon: EyeIcon },
]

function handleAction(key: string) {
  if (key === 'view')
    router.push(getConversationDetailRoute(props.row))
}
</script>

<template>
  <DataTableRowActions
    mode="buttons"
    :items="items"
    @action="handleAction"
  />
</template>
