import { useMutation } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'
import type { IStationApplyAddDTO } from './station-apply.payload'

export type { IStationApplyAddDTO } from './station-apply.payload'
export { buildStationApplyAddDTO } from './station-apply.payload'

/** 提交成功返回,对齐 StationApplySubmitVO;applyId 按字符串处理 */
export interface IStationApplySubmitVO {
  applyId: string
}

/** 提交官网开通申请(匿名,无需登录) */
export function useCreateStationApplyMutation() {
  const { apiFetch } = useApiFetch()

  return useMutation<IResponse<IStationApplySubmitVO>, Error, IStationApplyAddDTO>({
    mutationKey: ['createStationApply'],
    mutationFn: async data => await apiFetch<IResponse<IStationApplySubmitVO>>('/open/station-apply', {
      method: 'post',
      body: data,
    }),
  })
}
