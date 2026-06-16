import type { IConversation } from '@/services/api/conversation.api'

export function getConversationDetailRoute(item: IConversation): string {
  if (item.type === 1 || item.type === 2) {
    return `/apps/stream?chatId=${item.chatId}&skillId=${item.skillId}&thirdId=${item.thirdId}&type=${item.type}`
  }
  return `/conversations/${item.chatId}`
}
