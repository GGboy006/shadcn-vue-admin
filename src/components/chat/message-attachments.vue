<script setup lang="ts">
import type { IFileAttachment } from '@/services/api/conversation.api'

import { FileAttachment } from '@/components/agent-elements'

defineProps<{
  attachments?: IFileAttachment[] | null
}>()

function isImage(file: IFileAttachment) {
  return file.fileType === 'image'
}

function fileLabel(file: IFileAttachment) {
  return file.fileName || (isImage(file) ? '图片' : '文件')
}
</script>

<template>
  <div v-if="attachments?.length" class="mt-2 flex flex-wrap gap-2">
    <FileAttachment
      v-for="file in attachments"
      :id="String(file.fileId)"
      :key="`${file.fileId}`"
      :filename="fileLabel(file)"
      :size="file.fileSize || undefined"
      :is-image="isImage(file)"
      :url="file.fileUrl"
    />
  </div>
</template>
