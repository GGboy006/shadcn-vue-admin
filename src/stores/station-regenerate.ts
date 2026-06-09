import { defineStore } from 'pinia'

import type { IWizardStepForm } from '@/pages/apps/types/wizard.types'

interface StationRegenerateData {
  chatId: string
  /** 商户编码（站长模式下用于获取商户的动态数据） */
  merchantCode: string
  steps: IWizardStepForm[]
}

export const useStationRegenerateStore = defineStore('stationRegenerate', () => {
  // 站长重新生成数据（不持久化，页面跳转后自动清理）
  const regenerateData = ref<StationRegenerateData | null>(null)

  function setRegenerateData(data: StationRegenerateData) {
    regenerateData.value = data
  }

  function getRegenerateData(): StationRegenerateData | null {
    const data = regenerateData.value
    // 读取后自动清理，避免重复消费
    regenerateData.value = null
    return data
  }

  function clearRegenerateData() {
    regenerateData.value = null
  }

  return {
    regenerateData,
    setRegenerateData,
    getRegenerateData,
    clearRegenerateData,
  }
}, {
  // 不持久化到 localStorage，仅在内存中
  persist: false,
})
