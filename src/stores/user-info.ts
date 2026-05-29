import { defineStore } from 'pinia'

/** 站长信息 */
export interface BusinessStationMasterVO {
  stationId: number
  stationName: string
  communityCode: string
  communityName: string
  stationLevel: number
  serviceScope: string[]
  address: string
  contactPhone: string
  emergencyContact: string
  remark: string
}

/** 商户/物业信息 */
export interface BusinessMerchantVO {
  merchantId: string
  nickname: string
  phone: string
  avatar: string
  gender: number
  userStatus: number
  lastLoginTime: string
  merchantCode: string
  merchantName: string
  categoryCode: string
  logo: string
  bannerImages: string
  stationUserId: string
  type: number
  contactName: string
  contactPhone: string
  address: string
  externalUrl: string
  signDate: string
  signFee: number
  businessStatus: number
  businessHours: string
  minDeliveryAmount: number
  deliveryFee: number
  settlementCycle: number
  status: number
  remark: string
}

export const useUserInfoStore = defineStore('user-info', () => {
  const stationInfo = ref<BusinessStationMasterVO | null>(null)
  const merchantInfo = ref<BusinessMerchantVO | null>(null)

  function setStationInfo(info: BusinessStationMasterVO) {
    stationInfo.value = info
  }

  function setMerchantInfo(info: BusinessMerchantVO) {
    merchantInfo.value = info
  }

  function clearUserInfo() {
    stationInfo.value = null
    merchantInfo.value = null
  }

  return {
    stationInfo,
    merchantInfo,
    setStationInfo,
    setMerchantInfo,
    clearUserInfo,
  }
}, {
  persist: true,
})
