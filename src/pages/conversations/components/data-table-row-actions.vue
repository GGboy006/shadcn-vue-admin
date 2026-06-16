<script setup lang="ts">
import type { IConversation } from '@/services/api/conversation.api'

import { Button } from '@/components/ui/button'

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
  <Button variant="ghost" size="sm" @click="handleViewDetail">
    查看详情
  </Button>
</template>
