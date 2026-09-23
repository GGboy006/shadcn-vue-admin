import type { IResponse } from '../types/response.type'
import type { ICapability, ICapabilityListQuery } from './capability.api'

import { filterCapabilityList, normalizeCapability } from './capability.list'

/** 文档 §12 种子(Web VO,无 remark/status) */
export const MOCK_CAPABILITIES: ICapability[] = [
  {
    capabilityId: '1',
    capabilityCode: 'flyai',
    capabilityName: '飞猪酒旅',
    accessType: 2,
    provider: '飞猪',
    category: 'travel',
    icon: null,
    description: '酒店、机票、火车票、景点门票与行程规划',
    tags: ['酒店', '机票', '火车', '门票', '行程'],
    samplePrompts: ['泉城广场附近的酒店', '明天去上海的机票'],
    sortOrder: 1,
  },
  {
    capabilityId: '2',
    capabilityCode: 'owner-ai-assistant',
    capabilityName: '小区服务预约',
    accessType: 2,
    provider: '自研',
    category: 'reservation',
    icon: null,
    description: '预约小区家政、报修与上门服务',
    tags: ['预约', '家政', '报修'],
    samplePrompts: ['帮我预约明天上午的保洁', '水管漏了怎么报修'],
    sortOrder: 2,
  },
  {
    capabilityId: '3',
    capabilityCode: 'moji_weather',
    capabilityName: '墨迹天气',
    accessType: 1,
    provider: '墨迹',
    category: 'weather',
    icon: null,
    description: '天气、空气质量、限行与生活指数查询',
    tags: ['天气', '空气', '限行'],
    samplePrompts: ['济南今天天气怎么样', '明天用不用限行'],
    sortOrder: 3,
  },
  {
    capabilityId: '4',
    capabilityCode: 'oil_price',
    capabilityName: '今日油价',
    accessType: 1,
    provider: '自研',
    category: 'oil',
    icon: null,
    description: '查询各地汽柴油实时价格',
    tags: ['油价', '汽油', '柴油'],
    samplePrompts: ['山东今天油价多少', '95号汽油涨了吗'],
    sortOrder: 4,
  },
  {
    capabilityId: '5',
    capabilityCode: 'uu_errand',
    capabilityName: 'UU跑腿',
    accessType: 1,
    provider: 'UU跑腿',
    category: 'errand',
    icon: null,
    description: '帮取送、代买与跑腿下单',
    tags: ['跑腿', '代买', '取送'],
    samplePrompts: ['帮我取个快递', '附近有没有跑腿能买份午饭'],
    sortOrder: 5,
  },
  {
    capabilityId: '6',
    capabilityCode: 'mcdonalds',
    capabilityName: '麦当劳',
    accessType: 1,
    provider: '麦当劳',
    category: 'food',
    icon: null,
    description: '查询门店、菜单与点餐指引',
    tags: ['餐饮', '麦当劳'],
    samplePrompts: ['附近最近的麦当劳', '巨无霸套餐多少钱'],
    sortOrder: 6,
  },
  {
    capabilityId: '7',
    capabilityCode: 'kuaidi100',
    capabilityName: '快递100',
    accessType: 1,
    provider: '快递100',
    category: 'express',
    icon: null,
    description: '快递运单查询与物流轨迹',
    tags: ['快递', '物流'],
    samplePrompts: ['帮我查这个运单号', '我的快递到哪了'],
    sortOrder: 7,
  },
]

export async function mockCapabilityList(query: ICapabilityListQuery = {}): Promise<IResponse<ICapability[]>> {
  return {
    code: 0,
    msg: 'success',
    data: filterCapabilityList(MOCK_CAPABILITIES, query),
  }
}

export async function mockCapabilityDetail(capabilityId?: string): Promise<IResponse<ICapability>> {
  const item = MOCK_CAPABILITIES.find(entry => entry.capabilityId === String(capabilityId))
  if (!item)
    throw new Error('能力不存在')
  return {
    code: 0,
    msg: 'success',
    data: normalizeCapability(item),
  }
}
