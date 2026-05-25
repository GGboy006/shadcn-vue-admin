<script lang="ts" setup>
import { DownloadIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from '@/components/prop-ui/modal'

const isOpen = ref(false)
const file = ref()
const error = ref()

watch(file, () => {
  error.value = null
})
watch(isOpen, () => {
  file.value = null
})

function onSubmit() {
  error.value = null

  if (!file.value) {
    error.value = '请选择文件'
    return
  }

  toast('提交的数据如下：', {
    description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify(file.value, null, 2))),
  })
  isOpen.value = false
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalTrigger as-child>
      <UiButton variant="outline">
        导入
        <DownloadIcon />
      </UiButton>
    </ModalTrigger>

    <ModalContent>
      <ModalHeader>
        <ModalTitle>
          导入任务
        </ModalTitle>
        <ModalDescription>
          从 CSV 文件快速导入任务。
        </ModalDescription>
      </ModalHeader>

      <div class="grid w-full max-w-sm items-center gap-1.5">
        <UiLabel>文件</UiLabel>
        <UiInput id="file" v-model="file" type="file" />
        <span v-if="error" class="text-destructive">{{ error }}</span>
      </div>

      <ModalFooter>
        <UiButton variant="secondary" @click="isOpen = false">
          取消
        </UiButton>
        <UiButton @click="onSubmit">
          导入
        </UiButton>
      </ModalFooter>
    </ModalContent>
  </Modal>
</template>
