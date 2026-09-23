<script setup lang="ts">
import type { IFileAttachment } from '@/services/api/conversation.api'

defineProps<{
  attachments?: IFileAttachment[] | null
}>()

function isImage(file: IFileAttachment) {
  return file.fileType === 'image' && !!file.fileUrl
}
</script>

<template>
  <div v-if="attachments?.length" class="mt-2 flex flex-col gap-2">
    <template v-for="file in attachments" :key="`${file.fileId}`">
      <a
        v-if="isImage(file)"
        :href="file.fileUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="block w-40 overflow-hidden rounded-md"
      >
        <img
          :src="file.fileUrl"
          :alt="file.fileName || '图片'"
          class="h-auto w-full object-cover"
        >
      </a>
      <a
        v-else-if="file.fileUrl"
        :href="file.fileUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="max-w-full truncate text-xs underline"
      >
        {{ file.fileName || '文件' }}
      </a>
      <span v-else class="max-w-full truncate text-xs">
        {{ file.fileName || '文件' }}
      </span>
    </template>
  </div>
</template>
