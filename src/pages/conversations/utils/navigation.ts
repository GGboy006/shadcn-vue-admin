import type { IConversation } from '@/services/api/conversation.api'

export function getConversationDetailRoute(item: IConversation): string {
  // 数字员工会话（serviceMode=9）：跳转到数字员工对话页，employeeId 即 skillId
  if (item.serviceMode === 9) {
    return `/digital-employees/chat?employeeId=${item.skillId}&chatId=${item.chatId}`
  }
  if (item.type === 1 || item.type === 2) {
    return `/apps/stream?chatId=${item.chatId}&skillId=${item.skillId}&thirdId=${item.thirdId}&type=${item.type}`
  }
  return `/conversations/${item.chatId}`
}
